from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Settings
    APP_NAME: str = "AgentIQ"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    
    # LLM Settings
    ANTHROPIC_API_KEY: str
    LLM_MODEL: str = "claude-sonnet-4-20250514"
    
    # External APIs
    TAVILY_API_KEY: str = ""
    E2B_API_KEY: str = ""
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 3600
    
    # Token Budget Settings
    TOKEN_BUDGET_DAILY: float = 100.0  # USD per day
    TOKEN_BUDGET_PER_QUERY: float = 5.0  # USD per query
    COST_PER_INPUT_TOKEN: float = 15.0  # USD per 1M tokens
    COST_PER_OUTPUT_TOKEN: float = 75.0  # USD per 1M tokens
    
    # Performance
    MAX_CONCURRENT_REQUESTS: int = 100
    TIMEOUT_SECONDS: int = 30
    MAX_QUERY_LENGTH: int = 1000
    
    # Monitoring
    PROMETHEUS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "https://*.vercel.app"]
    
    # Agent Settings
    MAX_AGENTS_PER_QUERY: int = 10
    MAX_RETRIES_PER_AGENT: int = 3
    AGENT_TIMEOUT_SECONDS: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings() -> Settings:
    return Settings()
