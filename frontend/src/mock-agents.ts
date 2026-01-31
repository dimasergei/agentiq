import type { AgentExecutionPlan } from './api/agents';

export type { AgentExecutionPlan };

// Mock agent execution for Vite SPA
export async function mockExecuteAgentTask(task: string, agentRole: string = 'assistant'): Promise<AgentExecutionPlan> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Generate contextual execution plan based on task and role
  const taskLower = task.toLowerCase();
  let steps: AgentExecutionPlan['steps'] = [];
  let summary = '';
  let totalTime = '';

  if (taskLower.includes('analyze') || taskLower.includes('data')) {
    steps = [
      {
        step: 1,
        action: 'Data Collection',
        description: `Gather and validate ${agentRole === 'analyst' ? 'relevant datasets' : 'input data'} from specified sources`,
        estimatedTime: '2-3 minutes',
        confidence: 0.95
      },
      {
        step: 2,
        action: 'Pattern Recognition',
        description: `Apply ${agentRole === 'analyst' ? 'statistical models' : 'pattern matching algorithms'} to identify trends`,
        estimatedTime: '3-5 minutes',
        confidence: 0.88
      },
      {
        step: 3,
        action: 'Insight Generation',
        description: `Generate ${agentRole === 'analyst' ? 'data-driven insights' : 'actionable recommendations'} based on analysis`,
        estimatedTime: '1-2 minutes',
        confidence: 0.92
      }
    ];
    summary = `Comprehensive ${agentRole} analysis plan with data validation and insight generation`;
    totalTime = '6-10 minutes';
  } else if (taskLower.includes('create') || taskLower.includes('build')) {
    steps = [
      {
        step: 1,
        action: 'Requirement Analysis',
        description: `Define ${agentRole === 'developer' ? 'technical specifications' : 'project requirements'} and constraints`,
        estimatedTime: '1-2 minutes',
        confidence: 0.94
      },
      {
        step: 2,
        action: 'Implementation Planning',
        description: `Create ${agentRole === 'developer' ? 'development roadmap' : 'execution strategy'} with milestones`,
        estimatedTime: '2-3 minutes',
        confidence: 0.87
      },
      {
        step: 3,
        action: 'Resource Allocation',
        description: `Allocate ${agentRole === 'developer' ? 'development resources' : 'necessary tools'} for execution`,
        estimatedTime: '1-2 minutes',
        confidence: 0.91
      }
    ];
    summary = `${agentRole} creation plan with structured implementation approach`;
    totalTime = '4-7 minutes';
  } else {
    steps = [
      {
        step: 1,
        action: 'Task Decomposition',
        description: `Break down complex task into manageable subtasks for ${agentRole} execution`,
        estimatedTime: '1-2 minutes',
        confidence: 0.93
      },
      {
        step: 2,
        action: 'Strategy Formulation',
        description: `Develop ${agentRole === 'strategist' ? 'strategic approach' : 'execution methodology'} for task completion`,
        estimatedTime: '2-3 minutes',
        confidence: 0.89
      },
      {
        step: 3,
        action: 'Execution & Monitoring',
        description: `Execute plan with ${agentRole === 'monitor' ? 'real-time tracking' : 'quality assurance'} measures`,
        estimatedTime: '3-5 minutes',
        confidence: 0.90
      }
    ];
    summary = `General ${agentRole} execution plan with systematic approach`;
    totalTime = '6-10 minutes';
  }

  return {
    steps,
    summary,
    totalEstimatedTime: totalTime,
    successProbability: 0.85 + Math.random() * 0.1
  };
}
