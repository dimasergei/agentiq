export interface AgentExecutionPlan {
  steps: Array<{
    step: number;
    action: string;
    description: string;
    estimatedTime: string;
    confidence: number;
  }>;
  summary: string;
  totalEstimatedTime: string;
  successProbability: number;
}

export async function executeAgentTask(task: string, agentRole: string = 'assistant'): Promise<AgentExecutionPlan> {
  try {
    const response = await fetch('/api/agents/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task, agentRole }),
    });

    if (!response.ok) {
      throw new Error('Agent execution failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Agent execution error:', error);
    throw error;
  }
}
