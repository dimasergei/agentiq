'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Users, 
  Globe, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Activity, 
  BarChart3, 
  Cpu, 
  Network, 
  Database, 
  Code, 
  Terminal, 
  Command, 
  GitBranch, 
  Target, 
  Lightbulb, 
  Rocket, 
  TrendingUp, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle, 
  Clock, 
  MapPin
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AgentVisualization } from '@/components/agent-visualization'
import type { Agent } from '@/components/agent-visualization'
import { TaskCollaborationDemo } from '@/components/task-collaboration-demo'
import { cn } from '@/lib/utils'

const INITIAL_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Data Analyst',
    role: 'Data Processing',
    specialty: 'Statistical Analysis',
    status: 'idle',
    performance: {
      tasksCompleted: 142,
      avgResponseTime: 1.2,
      successRate: 98.5
    },
    thoughts: [],
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'text-blue-400',
    position: { x: 20, y: 30 },
    connections: ['2', '3']
  },
  {
    id: '2',
    name: 'Code Reviewer',
    role: 'Code Analysis',
    specialty: 'Security & Performance',
    status: 'idle',
    performance: {
      tasksCompleted: 89,
      avgResponseTime: 2.1,
      successRate: 96.2
    },
    thoughts: [],
    icon: <Code className="w-5 h-5" />,
    color: 'text-green-400',
    position: { x: 50, y: 20 },
    connections: ['1', '4']
  },
  {
    id: '3',
    name: 'Research Assistant',
    role: 'Information Gathering',
    specialty: 'Web Research & Synthesis',
    status: 'idle',
    performance: {
      tasksCompleted: 234,
      avgResponseTime: 0.8,
      successRate: 99.1
    },
    thoughts: [],
    icon: <Globe className="w-5 h-5" />,
    color: 'text-purple-400',
    position: { x: 80, y: 40 },
    connections: ['1', '4']
  },
  {
    id: '4',
    name: 'Security Auditor',
    role: 'Security Analysis',
    specialty: 'Vulnerability Assessment',
    status: 'idle',
    performance: {
      tasksCompleted: 67,
      avgResponseTime: 3.4,
      successRate: 94.8
    },
    thoughts: [],
    icon: <Shield className="w-5 h-5" />,
    color: 'text-red-400',
    position: { x: 35, y: 70 },
    connections: ['2', '3']
  }
]

export default function AgentIQ() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeTab, setActiveTab] = useState<'visualization' | 'collaboration'>('visualization')

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          status: Math.random() > 0.7 
            ? (['idle', 'thinking', 'processing', 'communicating', 'completed'] as const)[Math.floor(Math.random() * 5)]
            : agent.status
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulating])

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-500'
      case 'thinking': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'communicating': return 'bg-purple-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
  }

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating)
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full surface-glass-subtle z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gradient">AgentIQ</h1>
                <p className="text-xs text-muted-foreground">Multi-Agent Intelligence System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-muted/30 rounded-full px-3 py-1 surface-glass-subtle">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('visualization')}
                  className={cn(
                    "h-auto p-2 text-xs",
                    activeTab === 'visualization' && "bg-primary/20 text-primary"
                  )}
                >
                  Network
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('collaboration')}
                  className={cn(
                    "h-auto p-2 text-xs",
                    activeTab === 'collaboration' && "bg-primary/20 text-primary"
                  )}
                >
                  Tasks
                </Button>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
                  isSimulating && "bg-purple-500/15 text-purple-200 border-purple-500/30"
                )}
              >
                <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", isSimulating ? "bg-purple-400 pulse-glow" : "bg-emerald-400")} />
                {agents.filter(a => a.status !== 'idle').length} Active
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-muted/30 rounded-full px-4 py-2 mb-8 surface-glass-subtle">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent-foreground">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 leading-tight text-gradient animate-er-gradient">
              Intelligent
              <br />
              Agent Network
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Experience the power of multiple AI agents working together to provide comprehensive, 
              accurate, and actionable insights across complex tasks.
            </p>
            
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center animate-er-float">
                <div className="text-3xl font-bold text-gradient">{agents.length}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
              <div className="text-center animate-er-float" style={{ animationDelay: '0.5s' }}>
                <div className="text-3xl font-bold text-gradient">
                  {agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="text-center animate-er-float" style={{ animationDelay: '1s' }}>
                <div className="text-3xl font-bold text-gradient">
                  {Math.round(agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="surface-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Distributed Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Multiple specialized agents collaborate on complex tasks with intelligent workload distribution
                </p>
                <div className="flex items-center text-sm text-primary font-medium">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Learn more
                </div>
              </CardContent>
            </Card>

            <Card className="surface-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Real-time Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Parallel processing capabilities enable lightning-fast task completion and analysis
                </p>
                <div className="flex items-center text-sm text-secondary font-medium">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Learn more
                </div>
              </CardContent>
            </Card>

            <Card className="surface-glass hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Enterprise-grade security with built-in redundancy and error handling mechanisms
                </p>
                <div className="flex items-center text-sm text-accent font-medium">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Learn more
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Demo Section */}
          <div className="surface-glass rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold mb-4 text-gradient">Agent Collaboration Demo</h2>
            <p className="text-muted-foreground mb-6">Watch how multiple agents collaborate on complex tasks with real-time visualization.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button variant="outline" className="justify-start h-auto p-4 text-left border-border hover:bg-muted/50">
                <div>
                  <div className="font-medium mb-1">Network Visualization</div>
                  <div className="text-sm text-muted-foreground">See agents communicate and share insights</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start h-auto p-4 text-left border-border hover:bg-muted/50">
                <div>
                  <div className="font-medium mb-1">Task Collaboration</div>
                  <div className="text-sm text-muted-foreground">Watch agents work together on complex tasks</div>
                </div>
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90" onClick={toggleSimulation}>
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Demo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'visualization' ? (
              <motion.div
                key="visualization"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AgentVisualization
                  agents={agents}
                  onAgentClick={handleAgentClick}
                  isSimulating={isSimulating}
                  onToggleSimulation={toggleSimulation}
                />
              </motion.div>
            ) : (
              <motion.div
                key="collaboration"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCollaborationDemo
                  isSimulating={isSimulating}
                  onToggleSimulation={toggleSimulation}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Status Overview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="surface-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{agents.length}</div>
                <div className="text-xs text-muted-foreground">Active in network</div>
              </CardContent>
            </Card>

            <Card className="surface-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(agents.reduce((sum, a) => sum + a.performance.avgResponseTime, 0) / agents.length).toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Global average</div>
              </CardContent>
            </Card>

            <Card className="surface-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0)}
                </div>
                <div className="text-xs text-muted-foreground">All time total</div>
              </CardContent>
            </Card>

            <Card className="surface-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(agents.reduce((sum, a) => sum + a.performance.successRate, 0) / agents.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Network average</div>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 surface-glass-subtle">
                <Cpu className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">Advanced machine learning algorithms</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 surface-glass-subtle">
                <Activity className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-muted-foreground">Instant processing and response</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 surface-glass-subtle">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enterprise Grade</h3>
              <p className="text-muted-foreground">Bank-level security and compliance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 surface-glass-subtle">
                <GitBranch className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Scalable</h3>
              <p className="text-muted-foreground">Handles millions of requests daily</p>
            </div>
          </div>

          <footer className="mt-14 border-t border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">© 2026 AgentIQ. Multi-Agent Intelligence System.</p>
          </footer>
        </div>
      </section>
    </div>
  )
}
