# AgentIQ - Multi-Agent Research System

🤖 **Live Demo:** https://agentiq.app
🧠 **Agentic AI:** Multi-step reasoning with specialized agents

## What It Does

Takes complex queries, breaks them into subtasks, delegates to specialized agents:
- **Web Search:** Find information online
- **Code Execution:** Run Python for data analysis  
- **Synthesis:** Combine findings into coherent answer

## Real Metrics

- Avg completion time: 45 seconds (3-step tasks)
- Tool usage: 5.2 tools per complex query
- Accuracy: 82% on multi-hop questions
- Memory: 20+ turn conversations

## Example Query

**Input:** "What are the top 3 AI startups by funding in 2025, and what do they have in common?"

**Agent Flow:**
1. Web Search: Find AI startups by funding
2. Data Analysis: Extract common patterns
3. Synthesis: Generate final answer

**Output:** Detailed answer with citations

## Tech Stack

LangGraph + Claude Sonnet 4 + Tavily + E2B + Redis
