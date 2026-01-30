import httpx
from typing import List, Dict

class WebSearchAgent:
    """
    Web search using Tavily API
    
    Searches the web and returns relevant snippets with citations
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.tavily.com/search"
    
    async def search(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Search web for query
        
        Returns:
            List of results with title, content, url
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.base_url,
                json={
                    "api_key": self.api_key,
                    "query": query,
                    "max_results": max_results,
                    "include_answer": True,
                },
            )
            
            data = response.json()
            
            return [
                {
                    "title": r["title"],
                    "content": r["content"],
                    "url": r["url"],
                    "score": r.get("score", 0),
                }
                for r in data.get("results", [])
            ]
