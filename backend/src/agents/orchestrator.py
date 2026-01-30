from typing import List, Dict, Any
import asyncio

class AgentOrchestrator:
    """
    Coordinates multiple agents to solve complex queries
    
    - Plans task execution
    - Manages dependencies
    - Combines results
    - Maintains conversation memory
    """
    
    def __init__(self, agents: Dict[str, Any]):
        self.agents = agents
        self.planner = agents["planner"]
        self.memory = []
    
    async def execute(self, query: str) -> Dict[str, Any]:
        """
        Execute multi-agent workflow
        
        Returns:
            Final answer with intermediate steps
        """
        # 1. Plan
        tasks = await self.planner.plan(query)
        
        # 2. Execute tasks in order (respecting dependencies)
        results = {}
        
        for i, task in enumerate(tasks):
            # Wait for dependencies
            deps = task.get("depends_on", [])
            dep_results = {d: results[d] for d in deps if d in results}
            
            # Execute task
            agent_name = task["agent"]
            agent = self.agents[agent_name]
            
            result = await agent.execute(
                task["task"],
                context=dep_results,
            )
            
            results[i] = result
        
        # 3. Synthesize
        final_answer = await self.agents["synthesis"].synthesize(
            query=query,
            results=results,
        )
        
        return {
            "answer": final_answer,
            "steps": tasks,
            "intermediate_results": results,
        }
