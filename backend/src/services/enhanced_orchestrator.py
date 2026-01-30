import asyncio
import time
import uuid
from typing import List, Dict, Any, Optional
import structlog
from datetime import datetime

from src.agents.planner import PlannerAgent
from src.agents.web_search import WebSearchAgent
from src.agents.orchestrator import AgentOrchestrator
from src.core.config import get_settings
from src.core.exceptions import AgentExecutionException, TokenBudgetException
from src.services.token_budget import TokenBudgetManager
from src.monitoring.metrics import MetricsCollector

logger = structlog.get_logger()
settings = get_settings()

class EnhancedAgentOrchestrator:
    """
    Enterprise-grade agent orchestrator with token budget guardrails
    
    - Preserves existing multi-agent orchestration logic
    - Adds token budget checks before each agent call
    - Tracks costs and enforces limits
    - Provides detailed cost reporting
    """
    
    def __init__(
        self,
        agents: Dict[str, Any],
        token_budget_manager: TokenBudgetManager,
        metrics_collector: MetricsCollector
    ):
        self.agents = agents
        self.planner = agents["planner"]
        self.token_budget = token_budget_manager
        self.metrics = metrics_collector
        self.memory = []
        
        # Cost tracking for current query
        self.current_query_id = None
        self.current_query_cost = 0.0
        self.agent_costs = {}
    
    async def execute(self, query: str) -> Dict[str, Any]:
        """
        Execute multi-agent workflow with budget guardrails
        
        Args:
            query: User query to execute
            
        Returns:
            Final answer with intermediate steps and cost information
        """
        start_time = self.metrics.record_query_start()
        self.current_query_id = str(uuid.uuid4())
        self.current_query_cost = 0.0
        self.agent_costs = {}
        
        try:
            logger.info("query_started", query_id=self.current_query_id, query=query[:100])
            
            # 1. Plan tasks
            tasks = await self.planner.plan(query)
            
            # Validate number of agents
            if len(tasks) > settings.MAX_AGENTS_PER_QUERY:
                raise AgentExecutionException(
                    f"Too many agents required: {len(tasks)} > {settings.MAX_AGENTS_PER_QUERY}"
                )
            
            # 2. Execute tasks with budget checks
            results = {}
            total_estimated_cost = 0.0
            
            for i, task in enumerate(tasks):
                # Wait for dependencies
                deps = task.get("depends_on", [])
                dep_results = {d: results[d] for d in deps if d in results}
                
                # Execute task with budget guardrails
                agent_name = task["agent"]
                agent = self.agents[agent_name]
                
                try:
                    # Pre-flight budget check
                    budget_check = await self._pre_flight_agent_check(
                        agent_name, task, dep_results
                    )
                    
                    if not budget_check["approved"]:
                        raise TokenBudgetException(
                            f"Budget check failed for agent {agent_name}: "
                            f"{budget_check.get('error', 'Unknown error')}"
                        )
                    
                    # Execute agent
                    result = await self._execute_agent_with_budget_tracking(
                        agent, agent_name, task["task"], dep_results
                    )
                    
                    results[i] = result
                    
                    # Add estimated cost to total
                    total_estimated_cost += budget_check["estimated_cost"]
                    
                except Exception as e:
                    logger.error(
                        "agent_execution_failed",
                        agent=agent_name,
                        task=task["task"],
                        error=str(e),
                        query_id=self.current_query_id
                    )
                    raise AgentExecutionException(
                        f"Agent {agent_name} failed: {str(e)}"
                    )
            
            # 3. Synthesize final answer
            final_answer = await self.agents["synthesis"].synthesize(
                query=query,
                results=results,
            )
            
            # Record final metrics
            self.metrics.record_agents_used(len(tasks))
            self.metrics.record_cost(self.current_query_cost)
            
            execution_time = time.perf_counter() - start_time
            self.metrics.record_query_end(start_time, success=True)
            
            logger.info(
                "query_completed",
                query_id=self.current_query_id,
                total_cost=self.current_query_cost,
                execution_time=execution_time,
                agents_used=len(tasks)
            )
            
            return {
                "query_id": self.current_query_id,
                "answer": final_answer,
                "steps": tasks,
                "intermediate_results": results,
                "cost_breakdown": {
                    "total_cost": self.current_query_cost,
                    "agent_costs": self.agent_costs,
                    "estimated_cost": total_estimated_cost,
                    "currency": "USD"
                },
                "execution_time_seconds": execution_time,
                "agents_used": len(tasks)
            }
            
        except Exception as e:
            execution_time = time.perf_counter() - start_time
            self.metrics.record_query_end(start_time, success=False)
            
            logger.error(
                "query_failed",
                query_id=self.current_query_id,
                error=str(e),
                execution_time=execution_time
            )
            
            raise AgentExecutionException(f"Query execution failed: {str(e)}")
    
    async def _pre_flight_agent_check(
        self,
        agent_name: str,
        task: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Perform pre-flight budget check for agent execution
        
        Args:
            agent_name: Name of the agent to execute
            task: Task description
            context: Context from previous agents
            
        Returns:
            Budget check results
        """
        try:
            # Estimate input tokens
            task_text = task.get("task", "")
            context_text = str(context)
            input_text = f"{task_text}\n\nContext: {context_text}"
            
            # Rough token estimation (4 characters per token)
            estimated_input_tokens = len(input_text) // 4
            
            # Estimate output tokens based on agent type
            estimated_output_tokens = self._estimate_output_tokens(agent_name, task)
            
            # Perform budget check
            budget_check = await self.token_budget.pre_flight_check(
                estimated_input_tokens,
                estimated_output_tokens
            )
            
            return budget_check
            
        except Exception as e:
            logger.error(
                "pre_flight_check_failed",
                agent=agent_name,
                error=str(e)
            )
            # Fail open
            return {
                "approved": True,
                "estimated_cost": 0.0,
                "error": str(e)
            }
    
    async def _execute_agent_with_budget_tracking(
        self,
        agent: Any,
        agent_name: str,
        task: str,
        context: Dict[str, Any]
    ) -> Any:
        """
        Execute agent with cost tracking
        
        Args:
            agent: Agent instance to execute
            agent_name: Name of the agent
            task: Task description
            context: Context from previous agents
            
        Returns:
            Agent execution result
        """
        execution_start = self.metrics.record_agent_execution_start()
        
        try:
            # Execute the agent (preserving existing logic)
            if hasattr(agent, 'execute'):
                result = await agent.execute(task, context=context)
            elif hasattr(agent, 'search'):
                # Web search agent
                result = await agent.search(task)
            elif hasattr(agent, 'synthesize'):
                # Synthesis agent
                result = await agent.synthesize(query=task, results=context)
            else:
                raise AgentExecutionException(f"Unknown agent type: {agent_name}")
            
            execution_time = time.perf_counter() - execution_start
            self.metrics.record_agent_execution_end(execution_time)
            
            # Estimate and record token usage
            await self._record_agent_usage(agent_name, task, context, result)
            
            return result
            
        except Exception as e:
            execution_time = time.perf_counter() - execution_start
            self.metrics.record_agent_execution_end(execution_time)
            raise
    
    async def _record_agent_usage(
        self,
        agent_name: str,
        task: str,
        context: Dict[str, Any],
        result: Any
    ):
        """
        Record estimated token usage for agent execution
        
        Args:
            agent_name: Name of the agent
            task: Task description
            context: Context from previous agents
            result: Agent execution result
        """
        try:
            # Estimate input tokens
            input_text = f"{task}\n\nContext: {str(context)}"
            estimated_input_tokens = len(input_text) // 4
            
            # Estimate output tokens
            result_text = str(result)
            estimated_output_tokens = len(result_text) // 4
            
            # Record usage
            usage_record = await self.token_budget.record_usage(
                input_tokens=estimated_input_tokens,
                output_tokens=estimated_output_tokens,
                agent_name=agent_name,
                query_id=self.current_query_id
            )
            
            # Track cost for this agent
            agent_cost = usage_record.get("cost", 0.0)
            self.agent_costs[agent_name] = agent_cost
            self.current_query_cost += agent_cost
            
            logger.info(
                "agent_usage_recorded",
                query_id=self.current_query_id,
                agent=agent_name,
                cost=agent_cost,
                input_tokens=estimated_input_tokens,
                output_tokens=estimated_output_tokens
            )
            
        except Exception as e:
            logger.error(
                "agent_usage_recording_failed",
                agent=agent_name,
                query_id=self.current_query_id,
                error=str(e)
            )
    
    def _estimate_output_tokens(self, agent_name: str, task: Dict[str, Any]) -> int:
        """
        Estimate output tokens based on agent type and task
        
        Args:
            agent_name: Name of the agent
            task: Task description
            
        Returns:
            Estimated number of output tokens
        """
        # Base estimations by agent type
        agent_estimates = {
            "planner": 300,  # Planning tasks are structured JSON
            "web_search": 500,  # Search results can be verbose
            "data_analysis": 400,  # Data analysis results
            "synthesis": 800,  # Final synthesis is comprehensive
            "code_execution": 600,  # Code execution results
        }
        
        base_estimate = agent_estimates.get(agent_name, 500)
        
        # Adjust based on task complexity
        task_text = task.get("task", "")
        if len(task_text) > 200:
            base_estimate = int(base_estimate * 1.5)  # Complex tasks
        
        return base_estimate
    
    async def get_query_cost_breakdown(self, query_id: str) -> Dict[str, Any]:
        """Get detailed cost breakdown for a specific query"""
        if query_id != self.current_query_id:
            return {"error": "Query ID not found in current session"}
        
        return {
            "query_id": query_id,
            "total_cost": self.current_query_cost,
            "agent_costs": self.agent_costs,
            "currency": "USD",
            "model": settings.LLM_MODEL
        }
    
    async def get_budget_status(self) -> Dict[str, Any]:
        """Get current budget status"""
        return await self.token_budget.get_daily_usage()
