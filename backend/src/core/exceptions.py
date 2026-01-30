from typing import Any, Dict, Optional
from fastapi import HTTPException, status
import structlog

logger = structlog.get_logger()

class AgentIQException(Exception):
    """Base exception for AgentIQ"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(message)

class AgentExecutionException(AgentIQException):
    """Raised when agent execution fails"""
    pass

class TokenBudgetException(AgentIQException):
    """Raised when token budget is exceeded"""
    pass

class ValidationException(AgentIQException):
    """Raised when input validation fails"""
    pass

class RateLimitException(AgentIQException):
    """Raised when rate limit is exceeded"""
    pass

def create_http_exception(
    status_code: int,
    detail: str,
    headers: Optional[Dict[str, str]] = None
) -> HTTPException:
    """Create standardized HTTP exception"""
    logger.error(
        "http_exception",
        status_code=status_code,
        detail=detail,
        headers=headers
    )
    return HTTPException(status_code=status_code, detail=detail, headers=headers)
