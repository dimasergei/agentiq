import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Globe, Play, Bot, Brain, Network, Cpu, Activity, Users, MessageSquare, Lightbulb, Target } from 'lucide-react';
import { mockExecuteAgentTask, type AgentExecutionPlan } from './mock-agents';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'processing';
  x: number;
  y: number;
  connections: string[];
}

interface ThoughtProcess {
  agentId: string;
  agentName: string;
  thought: string;
  timestamp: Date;
}

export default function Home() {
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Analyzer', type: 'Data Analysis', status: 'idle', x: 20, y: 30, connections: ['2', '3'] },
    { id: '2', name: 'Researcher', type: 'Information Retrieval', status: 'idle', x: 50, y: 20, connections: ['1', '4'] },
    { id: '3', name: 'Synthesizer', type: 'Content Creation', status: 'idle', x: 80, y: 40, connections: ['1', '4'] },
    { id: '4', name: 'Validator', type: 'Quality Assurance', status: 'idle', x: 50, y: 70, connections: ['2', '3'] }
  ]);
  const [thoughtProcesses, setThoughtProcesses] = useState<ThoughtProcess[]>([]);
  const [metrics, setMetrics] = useState({
    totalAgents: 4,
    avgResponseTime: 1.2,
    tasksCompleted: 532,
    successRate: 97
  });

  useEffect(() => {
    if (!isCollaborating) return;

    const interval = setInterval(() => {
      // Update agent statuses
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.3 ? 'processing' : 'active'
      })));

      // Add thought processes
      const thoughts = [
        'Analyzing data patterns and correlations...',
        'Retrieving relevant information from knowledge base...',
        'Synthesizing findings into coherent narrative...',
        'Validating accuracy and completeness of results...'
      ];

      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const newThought: ThoughtProcess = {
        agentId: randomAgent.id,
        agentName: randomAgent.name,
        thought: thoughts[Math.floor(Math.random() * thoughts.length)],
        timestamp: new Date()
      };

      setThoughtProcesses(prev => [newThought, ...prev].slice(0, 5));

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        avgResponseTime: Math.max(0.5, Math.min(3, prev.avgResponseTime + (Math.random() - 0.5) * 0.2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isCollaborating, agents]);

  const [executionPlan, setExecutionPlan] = useState<AgentExecutionPlan | null>(null);
  const [currentTask, setCurrentTask] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeTask = async (task: string, agentRole: string = 'assistant') => {
    setCurrentTask(task);
    setIsExecuting(true);
    setExecutionPlan(null);

    try {
      const plan = await mockExecuteAgentTask(task, agentRole);
      setExecutionPlan(plan);
      
      // Simulate step-by-step execution
      for (const step of plan.steps) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Update thought process with current step
        const thought: ThoughtProcess = {
          agentId: 'system',
          agentName: `${agentRole} Agent`,
          thought: `Step ${step.step}: ${step.action} - ${step.description}`,
          timestamp: new Date()
        };
        setThoughtProcesses(prev => [thought, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Task execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const startCollaboration = () => {
    setIsCollaborating(true);
    setThoughtProcesses([]);
    // Execute a sample task
    executeTask('Analyze system performance and optimize resource allocation', 'analyst');
  };

  const stopCollaboration = () => {
    setIsCollaborating(false);
    setAgents(prev => prev.map(agent => ({ ...agent, status: 'idle' })));
  };

  return (
    <main className="min-h-screen bg-[#0A0E27] text-white overflow-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* 1. ATMOSPHERE (The "Enterprise" Glow) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* 2. NAVBAR (Floating Glass) */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-12 shadow-2xl">
          <div className="font-bold text-xl tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
            AgentIQ
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            {['Product', 'Solutions', 'Enterprise', 'Pricing'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
            ))}
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-all border border-white/5">
            Sign In
          </button>
        </div>
      </nav>

      {/* 3. HERO SECTION (The Big Structure) */}
      <div className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Neural Network Active
        </div>

        {/* HEADLINE */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent max-w-5xl">
          Autonomous Multi-Agent Swarm
        </h1>

        {/* SUBTITLE */}
        <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Orchestrate complex workflows with a network of specialized AI agents working in parallel execution.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-6 mb-20">
          <button 
            onClick={isCollaborating ? stopCollaboration : startCollaboration}
            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center gap-2"
          >
            {isCollaborating ? (
              <>
                <Activity className="w-5 h-5" />
                Stop Collaboration
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Agents
              </>
            )}
          </button>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold text-lg backdrop-blur-md transition-all flex items-center gap-2">
            <Network className="w-5 h-5" />
            View Network
          </button>
        </div>

        {/* 4. THE METRIC GLASS BAR (The EnterpriseRAG Signature) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/10">
            <div className="text-5xl font-bold text-white mb-2 tracking-tight">∞</div>
            <div className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest">Scalability</div>
          </div>
          
          <div className="relative flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/10">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 mb-2 tracking-tight">532</div>
            <div className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest">Active Agents</div>
          </div>
          
          <div className="relative flex flex-col items-center justify-center p-4">
            <div className="text-5xl font-bold text-white mb-2 tracking-tight">97%</div>
            <div className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest">Success Rate</div>
          </div>
        </div>

      </div>

      {/* 5. AGENT NETWORK VISUALIZATION */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Agent Network Visualization
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Watch AI agents collaborate in real-time with visible thought processes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Network Visualization */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Agent Network</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCollaborating ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-400">{isCollaborating ? 'Active' : 'Ready'}</span>
              </div>
            </div>
            
            <div className="relative h-80 bg-black/20 rounded-xl border border-white/5">
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {agents.map(agent => 
                  agent.connections.map(targetId => {
                    const target = agents.find(a => a.id === targetId);
                    if (!target) return null;
                    return (
                      <line
                        key={`${agent.id}-${targetId}`}
                        x1={`${agent.x}%`}
                        y1={`${agent.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke={isCollaborating ? '#10b981' : '#374151'}
                        strokeWidth="2"
                        strokeDasharray={isCollaborating ? '0' : '5,5'}
                        className={isCollaborating ? 'animate-pulse' : ''}
                      />
                    );
                  })
                )}
              </svg>
              
              {/* Agent Nodes */}
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    agent.status === 'processing' ? 'bg-emerald-500 border-emerald-400 animate-pulse' :
                    agent.status === 'active' ? 'bg-emerald-600 border-emerald-500' :
                    'bg-gray-600 border-gray-500'
                  }`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs text-center mt-1 text-white/80">{agent.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Thought Process Log */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Thought Process Log</h3>
              <Brain className="w-5 h-5 text-emerald-400" />
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {thoughtProcesses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Start collaboration to see thought processes
                </p>
              ) : (
                thoughtProcesses.map((thought, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border-l-4 border-emerald-400">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-emerald-400">{thought.agentName}</span>
                      <span className="text-xs text-gray-400">
                        {thought.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{thought.thought}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. FEATURE GRID (Glassmorphism) */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Distributed Intelligence</h3>
            <p className="text-gray-400 leading-relaxed">
              Multiple specialized agents collaborate on complex tasks with intelligent workload distribution.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Multi-Agent Sync</h3>
            <p className="text-gray-400 leading-relaxed">
              Real-time synchronization between agents ensures seamless collaboration and knowledge sharing.
            </p>
          </div>

          <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Complex Reasoning</h3>
            <p className="text-gray-400 leading-relaxed">
              Advanced reasoning capabilities enable agents to solve complex problems beyond single-agent limitations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
