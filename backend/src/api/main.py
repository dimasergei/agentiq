from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import structlog

from src.core.config import get_settings
from src.agents.planner import PlannerAgent
from src.agents.web_search import WebSearchAgent
from src.agents.orchestrator import AgentOrchestrator

settings = get_settings()
logger = structlog.get_logger()

app = FastAPI(
    title="AgentIQ",
    version="1.0.0",
    description="Multi-agent research system",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
planner = PlannerAgent()
web_search = WebSearchAgent(settings.TAVILY_API_KEY)

# Mock agents for demo
class MockSynthesisAgent:
    async def synthesize(self, query: str, results: Dict) -> str:
        return f"Based on the research, here's what I found about {query}. [Synthesized from {len(results)} sources]"

class MockDataAnalysisAgent:
    async def execute(self, task: str, context: Dict) -> Dict:
        return {"analysis": f"Analyzed data for: {task}", "insights": ["Key insight 1", "Key insight 2"]}

# Setup orchestrator
agents = {
    "planner": planner,
    "web_search": web_search,
    "data_analysis": MockDataAnalysisAgent(),
    "synthesis": MockSynthesisAgent(),
}

orchestrator = AgentOrchestrator(agents)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    steps: list
    intermediate_results: Dict[str, Any]
    execution_time: float

@app.post("/query", response_model=QueryResponse)
async def execute_query(request: QueryRequest):
    """Execute complex query using multi-agent system"""
    
    import time
    start_time = time.perf_counter()
    
    try:
        result = await orchestrator.execute(request.query)
        
        execution_time = time.perf_counter() - start_time
        
        return QueryResponse(
            answer=result["answer"],
            steps=result["steps"],
            intermediate_results=result["intermediate_results"],
            execution_time=execution_time,
        )
        
    except Exception as e:
        logger.error("query_execution_failed", error=str(e), exc_info=True)
        return QueryResponse(
            answer=f"Error executing query: {str(e)}",
            steps=[],
            intermediate_results={},
            execution_time=0,
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
