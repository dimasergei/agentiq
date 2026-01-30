from typing import List
from anthropic import AsyncAnthropic
import json

class PlannerAgent:
    """
    Breaks complex queries into subtasks
    
    Uses chain-of-thought prompting to decompose problems
    """
    
    def __init__(self):
        self.client = AsyncAnthropic()
        self.model = "claude-sonnet-4-20250514"
    
    async def plan(self, query: str) -> List[dict]:
        """
        Create execution plan for query
        
        Returns:
            List of subtasks with assigned agents
        """
        prompt = f"""You are a planning agent. Break this query into subtasks.

Query: {query}

Think step by step:
1. What information do we need?
2. What tools can get that information?
3. In what order should tasks be executed?

Output JSON array of tasks:
[
  {{"task": "search web for X", "agent": "web_search", "depends_on": []}},
  {{"task": "analyze data Y", "agent": "data_analysis", "depends_on": [0]}},
  {{"task": "synthesize findings", "agent": "synthesis", "depends_on": [0, 1]}}
]
"""
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}],
        )
        
        # Parse JSON
        text = response.content[0].text
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0]
        else:
            json_str = text
        
        tasks = json.loads(json_str)
        return tasks
