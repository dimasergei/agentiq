import asyncio
import time
from typing import Dict, Any, Optional
import redis.asyncio as redis
import structlog
from datetime import datetime, date

from src.core.config import get_settings
from src.core.exceptions import TokenBudgetException

logger = structlog.get_logger()
settings = get_settings()

class TokenBudgetManager:
    """
    Enterprise token budget guardrails for AgentIQ
    
    - Tracks daily token usage and costs
    - Enforces per-query and daily budget limits
    - Calculates costs before each agent call
    - Provides budget monitoring and alerts
    """
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.daily_budget = settings.TOKEN_BUDGET_DAILY
        self.per_query_budget = settings.TOKEN_BUDGET_PER_QUERY
        self.cost_per_input_token = settings.COST_PER_INPUT_TOKEN / 1_000_000  # Convert to per-token cost
        self.cost_per_output_token = settings.COST_PER_OUTPUT_TOKEN / 1_000_000
    
    async def check_daily_budget(self, estimated_cost: float) -> bool:
        """
        Check if estimated cost fits within daily budget
        
        Args:
            estimated_cost: Estimated cost for the operation
            
        Returns:
            True if within budget, False otherwise
        """
        try:
            # Get current daily usage
            current_usage = await self._get_daily_usage()
            remaining_budget = self.daily_budget - current_usage
            
            if estimated_cost > remaining_budget:
                logger.warning(
                    "daily_budget_exceeded",
                    estimated_cost=estimated_cost,
                    current_usage=current_usage,
                    remaining_budget=remaining_budget,
                    daily_budget=self.daily_budget
                )
                return False
            
            return True
            
        except Exception as e:
            logger.error("daily_budget_check_failed", error=str(e))
            # Fail open - allow request if budget check fails
            return True
    
    async def check_per_query_budget(self, estimated_cost: float) -> bool:
        """
        Check if estimated cost fits within per-query budget
        
        Args:
            estimated_cost: Estimated cost for the operation
            
        Returns:
            True if within budget, False otherwise
        """
        if estimated_cost > self.per_query_budget:
            logger.warning(
                "per_query_budget_exceeded",
                estimated_cost=estimated_cost,
                per_query_budget=self.per_query_budget
            )
            return False
        
        return True
    
    async def calculate_cost_estimate(
        self,
        input_tokens: int,
        output_tokens_estimate: int = 500
    ) -> float:
        """
        Calculate cost estimate for token usage
        
        Args:
            input_tokens: Number of input tokens
            output_tokens_estimate: Estimated number of output tokens
            
        Returns:
            Estimated cost in USD
        """
        input_cost = input_tokens * self.cost_per_input_token
        output_cost = output_tokens_estimate * self.cost_per_output_token
        total_cost = input_cost + output_cost
        
        return total_cost
    
    async def pre_flight_check(
        self,
        input_tokens: int,
        output_tokens_estimate: int = 500
    ) -> Dict[str, Any]:
        """
        Perform pre-flight budget check before agent execution
        
        Args:
            input_tokens: Number of input tokens
            output_tokens_estimate: Estimated number of output tokens
            
        Returns:
            Budget check results
            
        Raises:
            TokenBudgetException: If budget limits are exceeded
        """
        try:
            # Calculate estimated cost
            estimated_cost = await self.calculate_cost_estimate(
                input_tokens, output_tokens_estimate
            )
            
            # Check per-query budget
            per_query_ok = await self.check_per_query_budget(estimated_cost)
            if not per_query_ok:
                raise TokenBudgetException(
                    f"Per-query budget exceeded. Estimated cost: ${estimated_cost:.4f}, "
                    f"Budget: ${self.per_query_budget:.4f}"
                )
            
            # Check daily budget
            daily_ok = await self.check_daily_budget(estimated_cost)
            if not daily_ok:
                current_usage = await self._get_daily_usage()
                raise TokenBudgetException(
                    f"Daily budget exceeded. Estimated cost: ${estimated_cost:.4f}, "
                    f"Remaining: ${self.daily_budget - current_usage:.4f}"
                )
            
            # Get current budget status
            current_usage = await self._get_daily_usage()
            budget_usage_percent = (current_usage / self.daily_budget) * 100
            
            return {
                "approved": True,
                "estimated_cost": estimated_cost,
                "current_daily_usage": current_usage,
                "remaining_daily_budget": self.daily_budget - current_usage,
                "budget_usage_percent": budget_usage_percent,
                "per_query_budget_remaining": self.per_query_budget - estimated_cost
            }
            
        except TokenBudgetException:
            raise
        except Exception as e:
            logger.error("pre_flight_check_failed", error=str(e))
            # Fail open - allow request if check fails
            return {
                "approved": True,
                "estimated_cost": 0.0,
                "error": str(e)
            }
    
    async def record_usage(
        self,
        input_tokens: int,
        output_tokens: int,
        agent_name: str,
        query_id: str
    ) -> Dict[str, Any]:
        """
        Record actual token usage after agent execution
        
        Args:
            input_tokens: Actual input tokens used
            output_tokens: Actual output tokens used
            agent_name: Name of the agent that was called
            query_id: Unique query identifier
            
        Returns:
            Usage record details
        """
        try:
            # Calculate actual cost
            actual_cost = await self.calculate_cost_estimate(input_tokens, output_tokens)
            
            # Record usage
            usage_record = {
                "timestamp": time.time(),
                "date": date.today().isoformat(),
                "query_id": query_id,
                "agent_name": agent_name,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "cost": actual_cost,
                "model": settings.LLM_MODEL
            }
            
            # Store in Redis
            await self._store_usage_record(usage_record)
            
            # Update daily totals
            await self._update_daily_totals(actual_cost, input_tokens + output_tokens)
            
            logger.info(
                "usage_recorded",
                query_id=query_id,
                agent=agent_name,
                tokens=usage_record["total_tokens"],
                cost=actual_cost
            )
            
            return usage_record
            
        except Exception as e:
            logger.error("usage_recording_failed", query_id=query_id, error=str(e))
            return {"error": str(e)}
    
    async def get_daily_usage(self) -> Dict[str, Any]:
        """Get current daily usage statistics"""
        try:
            today = date.today().isoformat()
            usage_key = f"daily_usage:{today}"
            
            usage_data = await self.redis.hgetall(usage_key)
            
            if not usage_data:
                return {
                    "date": today,
                    "total_cost": 0.0,
                    "total_tokens": 0,
                    "queries_processed": 0,
                    "budget_usage_percent": 0.0
                }
            
            # Convert strings to appropriate types
            total_cost = float(usage_data.get(b"total_cost", b"0.0"))
            total_tokens = int(usage_data.get(b"total_tokens", b"0"))
            queries_processed = int(usage_data.get(b"queries_processed", b"0"))
            budget_usage_percent = (total_cost / self.daily_budget) * 100
            
            return {
                "date": today,
                "total_cost": total_cost,
                "total_tokens": total_tokens,
                "queries_processed": queries_processed,
                "budget_usage_percent": min(budget_usage_percent, 100),
                "daily_budget": self.daily_budget,
                "remaining_budget": self.daily_budget - total_cost
            }
            
        except Exception as e:
            logger.error("daily_usage_retrieval_failed", error=str(e))
            return {"error": str(e)}
    
    async def get_usage_history(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get usage history for the past N days"""
        try:
            history = []
            
            for i in range(days):
                past_date = date.fromordinal(date.today().toordinal() - i)
                usage_key = f"daily_usage:{past_date.isoformat()}"
                
                usage_data = await self.redis.hgetall(usage_key)
                
                if usage_data:
                    history.append({
                        "date": past_date.isoformat(),
                        "total_cost": float(usage_data.get(b"total_cost", b"0.0")),
                        "total_tokens": int(usage_data.get(b"total_tokens", b"0")),
                        "queries_processed": int(usage_data.get(b"queries_processed", b"0")),
                        "budget_usage_percent": min(
                            (float(usage_data.get(b"total_cost", b"0.0")) / self.daily_budget) * 100,
                            100
                        )
                    })
                else:
                    history.append({
                        "date": past_date.isoformat(),
                        "total_cost": 0.0,
                        "total_tokens": 0,
                        "queries_processed": 0,
                        "budget_usage_percent": 0.0
                    })
            
            return list(reversed(history))
            
        except Exception as e:
            logger.error("usage_history_retrieval_failed", error=str(e))
            return []
    
    async def _get_daily_usage(self) -> float:
        """Get current daily cost usage"""
        try:
            today = date.today().isoformat()
            usage_key = f"daily_usage:{today}"
            
            total_cost = await self.redis.hget(usage_key, "total_cost")
            return float(total_cost) if total_cost else 0.0
            
        except Exception:
            return 0.0
    
    async def _store_usage_record(self, usage_record: Dict[str, Any]):
        """Store individual usage record"""
        try:
            # Store in daily usage log
            today = usage_record["date"]
            usage_log_key = f"usage_log:{today}"
            
            await self.redis.lpush(
                usage_log_key,
                str(usage_record)
            )
            await self.redis.expire(usage_log_key, 86400 * 30)  # Keep 30 days
            
        except Exception as e:
            logger.error("usage_record_storage_failed", error=str(e))
    
    async def _update_daily_totals(self, cost: float, tokens: int):
        """Update daily usage totals"""
        try:
            today = date.today().isoformat()
            usage_key = f"daily_usage:{today}"
            
            # Update totals atomically
            pipe = self.redis.pipeline()
            pipe.hincrbyfloat(usage_key, "total_cost", cost)
            pipe.hincrby(usage_key, "total_tokens", tokens)
            pipe.hincrby(usage_key, "queries_processed", 1)
            pipe.expire(usage_key, 86400 * 7)  # Keep 7 days
            await pipe.execute()
            
        except Exception as e:
            logger.error("daily_totals_update_failed", error=str(e))
    
    async def reset_daily_usage(self, target_date: str = None):
        """Reset daily usage (for testing or manual override)"""
        try:
            reset_date = target_date or date.today().isoformat()
            usage_key = f"daily_usage:{reset_date}"
            
            await self.redis.delete(usage_key)
            
            logger.info("daily_usage_reset", date=reset_date)
            
        except Exception as e:
            logger.error("daily_usage_reset_failed", error=str(e))
