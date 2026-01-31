'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Zap, 
  MessageSquare, 
  Activity, 
  Cpu, 
  Network, 
  Play, 
  Pause, 
  Settings, 
  Sparkles,
  ArrowRight,
  Lightbulb,
  Target,
  GitBranch,
  Terminal,
  Command,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  role: string
  status: 'idle' | 'thinking' | 'processing' | 'communicating' | 'completed'
  specialty: string
  performance: {
    tasksCompleted: number
    avgResponseTime: number
    successRate: number
  }
  thoughts: Thought[]
  connections: string[]
  position: { x: number; y: number }
  color: string
  icon: React.ReactNode
}

interface Thought {
  id: string
  type: 'analysis' | 'decision' | 'query' | 'response' | 'insight'
  content: string
  timestamp: Date
  targetAgent?: string
}

interface AgentVisualizationProps {
  agents: Agent[]
  onAgentClick?: (agent: Agent) => void
  isSimulating?: boolean
  onToggleSimulation?: () => void
}

// Export the Agent interface for use in other components
export type { Agent }

export function AgentVisualization({ 
  agents, 
  onAgentClick, 
  isSimulating = false, 
  onToggleSimulation 
}: AgentVisualizationProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [thoughtLog, setThoughtLog] = useState<Thought[]>([])
  const [activeConnections, setActiveConnections] = useState<Array<{from: string, to: string}>>([])

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      // Simulate agent thoughts
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      const thoughtTypes: Thought['type'][] = ['analysis', 'decision', 'query', 'response', 'insight']
      
      const newThought: Thought = {
        id: Math.random().toString(36).substr(2, 9),
        type: thoughtTypes[Math.floor(Math.random() * thoughtTypes.length)],
        content: generateThoughtContent(randomAgent.role, thoughtTypes[Math.floor(Math.random() * thoughtTypes.length)]),
        timestamp: new Date(),
        targetAgent: Math.random() > 0.7 ? agents[Math.floor(Math.random() * agents.length)].id : undefined
      }

      setThoughtLog(prev => [newThought, ...prev.slice(0, 19)])

      // Simulate agent communication
      if (newThought.targetAgent && Math.random() > 0.5) {
        setActiveConnections(prev => [
          ...prev,
          { from: randomAgent.id, to: newThought.targetAgent! }
        ])
        
        setTimeout(() => {
          setActiveConnections(prev => 
            prev.filter(conn => !(conn.from === randomAgent.id && conn.to === newThought.targetAgent))
          )
        }, 2000)
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [isSimulating, agents])

  const generateThoughtContent = (role: string, type: Thought['type']) => {
    const templates = {
      analysis: [
        `Analyzing data patterns for ${role.toLowerCase()}...`,
        `Processing complex ${role.toLowerCase()} algorithms...`,
        `Evaluating ${role.toLowerCase()} parameters...`
      ],
      decision: [
        `Decision: Optimize ${role.toLowerCase()} strategy`,
        `Conclusion: ${role} approach validated`,
        `Resolution: ${role} task completed successfully`
      ],
      query: [
        `Query: Requesting data from other agents...`,
        `Question: Need input for ${role.toLowerCase()} analysis`,
        `Inquiry: Cross-referencing with other modules`
      ],
      response: [
        `Response: ${role} analysis complete`,
        `Answer: Providing ${role.toLowerCase()} insights`,
        `Reply: ${role} results ready`
      ],
      insight: [
        `Insight: Discovered pattern in ${role.toLowerCase()} data`,
        `Discovery: New ${role.toLowerCase()} optimization found`,
        `Realization: ${role} efficiency improved by 23%`
      ]
    }

    const typeTemplates = templates[type]
    return typeTemplates[Math.floor(Math.random() * typeTemplates.length)]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500'
      case 'thinking': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'communicating': return 'bg-purple-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getThoughtIcon = (type: Thought['type']) => {
    switch (type) {
      case 'analysis': return <Brain className="w-4 h-4" />
      case 'decision': return <Target className="w-4 h-4" />
      case 'query': return <MessageSquare className="w-4 h-4" />
      case 'response': return <CheckCircle2 className="w-4 h-4" />
      case 'insight': return <Lightbulb className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getThoughtColor = (type: Thought['type']) => {
    switch (type) {
      case 'analysis': return 'text-blue-400'
      case 'decision': return 'text-green-400'
      case 'query': return 'text-yellow-400'
      case 'response': return 'text-purple-400'
      case 'insight': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="surface-glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Agent Network Visualization
            <Badge 
              variant={isSimulating ? "destructive" : "secondary"}
              className={isSimulating ? "bg-purple-500/15 text-purple-200 border-purple-500/30" : "bg-primary/15 text-primary-foreground border-primary/20"}
            >
              <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", isSimulating ? "bg-purple-400 pulse-glow" : "bg-primary")} />
              {isSimulating ? 'Collaborating' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Watch AI agents collaborate in real-time with visible thought processes
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Active Agents: {agents.filter(a => a.status !== 'idle').length}</span>
                <span>Thoughts Generated: {thoughtLog.length}</span>
                <span>Active Connections: {activeConnections.length}</span>
              </div>
            </div>
            <Button
              onClick={onToggleSimulation}
              className={cn(
                "transition-all duration-300",
                isSimulating 
                  ? "bg-purple-500 hover:bg-purple-600 text-white" 
                  : "bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90"
              )}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Collaboration
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Collaboration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Network Visualization */}
      <Card className="surface-glass">
        <CardHeader>
          <CardTitle className="text-lg">Agent Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 surface-glass-subtle rounded-lg overflow-hidden border border-border">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="rgba(168, 85, 247, 0.6)"
                  />
                </marker>
              </defs>
              
              <AnimatePresence>
                {activeConnections.map((connection, index) => {
                  const fromAgent = agents.find(a => a.id === connection.from)
                  const toAgent = agents.find(a => a.id === connection.to)
                  
                  if (!fromAgent || !toAgent) return null
                  
                  return (
                    <motion.line
                      key={`${connection.from}-${connection.to}-${index}`}
                      x1={fromAgent.position.x}
                      y1={fromAgent.position.y}
                      x2={toAgent.position.x}
                      y2={toAgent.position.y}
                      stroke="rgba(168, 85, 247, 0.6)"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      exit={{ pathLength: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )
                })}
              </AnimatePresence>
            </svg>

            {/* Agent Nodes */}
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${agent.position.x}%`,
                  top: `${agent.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => {
                  setSelectedAgent(agent)
                  onAgentClick?.(agent)
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Status Pulse */}
                {agent.status !== 'idle' && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full",
                      agent.status === 'thinking' && "bg-yellow-500/30",
                      agent.status === 'processing' && "bg-blue-500/30",
                      agent.status === 'communicating' && "bg-purple-500/30",
                      agent.status === 'completed' && "bg-green-500/30"
                    )}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0.2, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Agent Node */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border-2 border-white shadow-lg flex items-center justify-center",
                      agent.color
                    )}
                  >
                    {agent.icon}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                    getStatusColor(agent.status)
                  )} />
                </div>

                {/* Agent Label */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="surface-glass px-2 py-1 rounded text-xs font-medium">
                    {agent.name}
                  </div>
                  <div className="text-xs text-muted-foreground text-center capitalize">
                    {agent.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thought Process Log */}
      <Card className="surface-glass">
        <CardHeader>
          <CardTitle className="text-lg">Thought Process Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {thoughtLog.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {isSimulating ? 'Waiting for agent thoughts...' : 'Start collaboration to see thought processes'}
                  </p>
                </div>
              ) : (
                thoughtLog.map((thought, index) => (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="surface-glass-subtle rounded-lg p-3 border border-border"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn("mt-1", getThoughtColor(thought.type))}>
                        {getThoughtIcon(thought.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {thought.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {thought.timestamp.toLocaleTimeString()}
                          </span>
                          {thought.targetAgent && (
                            <Badge variant="secondary" className="text-xs">
                              → {agents.find(a => a.id === thought.targetAgent)?.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{thought.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {selectedAgent.name}
                <Badge className={getStatusColor(selectedAgent.status)}>
                  {selectedAgent.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="surface-glass-subtle rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Role</span>
                  </div>
                  <div className="text-lg font-bold">{selectedAgent.role}</div>
                </div>

                <div className="surface-glass-subtle rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Network className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Connections</span>
                  </div>
                  <div className="text-lg font-bold">{selectedAgent.connections.length}</div>
                </div>

                <div className="surface-glass-subtle rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Recent Thoughts</span>
                  </div>
                  <div className="text-lg font-bold">
                    {thoughtLog.filter(t => agents.find(a => a.id === selectedAgent.id)?.name === t.content.split(' ')[0]).length}
                  </div>
                </div>

                <div className="surface-glass-subtle rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Efficiency</span>
                  </div>
                  <div className="text-lg font-bold">94.2%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
