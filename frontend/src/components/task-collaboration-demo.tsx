'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  GitBranch, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  Database,
  Globe,
  Shield,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string
  complexity: 'low' | 'medium' | 'high' | 'critical'
  assignedAgents: string[]
  status: 'pending' | 'in-progress' | 'review' | 'completed'
  progress: number
  subtasks: Subtask[]
  insights: string[]
  startTime?: Date
  completionTime?: Date
}

interface Subtask {
  id: string
  title: string
  assignedAgent: string
  status: 'pending' | 'in-progress' | 'completed'
  result?: string
}

interface TaskCollaborationDemoProps {
  isSimulating?: boolean
  onToggleSimulation?: () => void
}

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Market Research Analysis',
    description: 'Comprehensive analysis of market trends and competitor landscape',
    complexity: 'high',
    assignedAgents: ['Research Assistant', 'Data Analyst'],
    status: 'pending',
    progress: 0,
    subtasks: [
      { id: '1-1', title: 'Gather market data', assignedAgent: 'Research Assistant', status: 'pending' },
      { id: '1-2', title: 'Analyze competitor strategies', assignedAgent: 'Data Analyst', status: 'pending' },
      { id: '1-3', title: 'Generate insights report', assignedAgent: 'Research Assistant', status: 'pending' }
    ],
    insights: []
  },
  {
    id: '2',
    title: 'Security Vulnerability Assessment',
    description: 'Comprehensive security audit of application infrastructure',
    complexity: 'critical',
    assignedAgents: ['Security Auditor', 'Code Reviewer'],
    status: 'pending',
    progress: 0,
    subtasks: [
      { id: '2-1', title: 'Scan for common vulnerabilities', assignedAgent: 'Security Auditor', status: 'pending' },
      { id: '2-2', title: 'Review code for security flaws', assignedAgent: 'Code Reviewer', status: 'pending' },
      { id: '2-3', title: 'Generate security report', assignedAgent: 'Security Auditor', status: 'pending' }
    ],
    insights: []
  },
  {
    id: '3',
    title: 'Performance Optimization',
    description: 'Optimize system performance and identify bottlenecks',
    complexity: 'medium',
    assignedAgents: ['Data Analyst', 'Code Reviewer'],
    status: 'pending',
    progress: 0,
    subtasks: [
      { id: '3-1', title: 'Analyze performance metrics', assignedAgent: 'Data Analyst', status: 'pending' },
      { id: '3-2', title: 'Identify optimization opportunities', assignedAgent: 'Code Reviewer', status: 'pending' },
      { id: '3-3', title: 'Implement optimizations', assignedAgent: 'Code Reviewer', status: 'pending' }
    ],
    insights: []
  }
]

export function TaskCollaborationDemo({ 
  isSimulating = false, 
  onToggleSimulation 
}: TaskCollaborationDemoProps) {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [completedTasks, setCompletedTasks] = useState<number>(0)

  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks]
        
        // Find a task that's not completed
        const activeTaskIndex = updatedTasks.findIndex(task => task.status !== 'completed')
        
        if (activeTaskIndex === -1) return updatedTasks
        
        const activeTask = updatedTasks[activeTaskIndex]
        
        // Update task status
        if (activeTask.status === 'pending') {
          activeTask.status = 'in-progress'
          activeTask.startTime = new Date()
        } else if (activeTask.status === 'in-progress') {
          // Update subtasks
          const pendingSubtask = activeTask.subtasks.find(st => st.status === 'pending')
          if (pendingSubtask) {
            pendingSubtask.status = 'in-progress'
            
            setTimeout(() => {
              setTasks(prev => {
                const taskIndex = prev.findIndex(t => t.id === activeTask.id)
                if (taskIndex === -1) return prev
                
                const task = prev[taskIndex]
                const subtaskIndex = task.subtasks.findIndex(st => st.id === pendingSubtask.id)
                if (subtaskIndex === -1) return prev
                
                task.subtasks[subtaskIndex].status = 'completed'
                task.subtasks[subtaskIndex].result = generateSubtaskResult(pendingSubtask.title, pendingSubtask.assignedAgent)
                
                // Add insight
                const insight = generateInsight(task.title, pendingSubtask.assignedAgent)
                if (!task.insights.includes(insight)) {
                  task.insights.push(insight)
                }
                
                // Update progress
                const completedSubtasks = task.subtasks.filter(st => st.status === 'completed').length
                task.progress = Math.round((completedSubtasks / task.subtasks.length) * 100)
                
                // Check if all subtasks are completed
                if (task.subtasks.every(st => st.status === 'completed')) {
                  task.status = 'review'
                  setTimeout(() => {
                    setTasks(prev => {
                      const taskIndex = prev.findIndex(t => t.id === task.id)
                      if (taskIndex === -1) return prev
                      
                      prev[taskIndex].status = 'completed'
                      prev[taskIndex].completionTime = new Date()
                      setCompletedTasks(c => c + 1)
                      
                      return [...prev]
                    })
                  }, 2000)
                }
                
                return [...prev]
              })
            }, 2000 + Math.random() * 2000)
          }
        }
        
        return updatedTasks
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isSimulating])

  const generateSubtaskResult = (title: string, agent: string): string => {
    const results = [
      `Successfully analyzed ${title.toLowerCase()} with advanced algorithms`,
      `Completed ${title.toLowerCase()} with 98% accuracy`,
      `Processed ${title.toLowerCase()} and identified key patterns`,
      `Executed ${title.toLowerCase()} with optimal performance`
    ]
    return results[Math.floor(Math.random() * results.length)]
  }

  const generateInsight = (taskTitle: string, agent: string): string => {
    const insights = [
      `${agent} identified critical patterns in ${taskTitle.toLowerCase()}`,
      `Optimization opportunity discovered by ${agent}`,
      `${agent} found efficiency improvements in ${taskTitle.toLowerCase()}`,
      `Risk assessment completed by ${agent} for ${taskTitle.toLowerCase()}`
    ]
    return insights[Math.floor(Math.random() * insights.length)]
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'critical': return 'bg-red-500/15 text-red-200 border-red-500/30'
      case 'high': return 'bg-orange-500/15 text-orange-200 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30'
      case 'low': return 'bg-green-500/15 text-green-200 border-green-500/30'
      default: return 'bg-gray-500/15 text-gray-200 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'review': return 'bg-blue-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'pending': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date()
    const duration = Math.round((end.getTime() - startTime.getTime()) / 1000)
    return `${duration}s`
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="surface-glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Task Collaboration Demo
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-primary/15 text-primary-foreground border-primary/20">
                {completedTasks} Completed
              </Badge>
              <Badge 
                variant={isSimulating ? "destructive" : "secondary"}
                className={isSimulating ? "bg-purple-500/15 text-purple-200 border-purple-500/30" : "bg-primary/15 text-primary-foreground border-primary/20"}
              >
                <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", isSimulating ? "bg-purple-400 pulse-glow" : "bg-primary")} />
                {isSimulating ? 'Collaborating' : 'Ready'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Watch AI agents collaborate on complex tasks with real-time progress tracking
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Total Tasks: {tasks.length}</span>
                <span>Active: {tasks.filter(t => t.status === 'in-progress').length}</span>
                <span>Completed: {completedTasks}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTasks(SAMPLE_TASKS)
                  setCompletedTasks(0)
                  setSelectedTask(null)
                }}
                className="border-border hover:bg-muted/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "surface-glass cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-1",
                  selectedTask?.id === task.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTask(task)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getComplexityColor(task.complexity)}>
                      {task.complexity.toUpperCase()}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", getStatusColor(task.status))} />
                  </div>
                  <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Assigned Agents */}
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {task.assignedAgents.join(', ')}
                      </span>
                    </div>

                    {/* Subtasks */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Subtasks:</div>
                      {task.subtasks.map((subtask, idx) => (
                        <div key={subtask.id} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1">{subtask.title}</span>
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(subtask.status))} />
                        </div>
                      ))}
                    </div>

                    {/* Duration */}
                    {task.startTime && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {task.completionTime 
                            ? formatDuration(task.startTime, task.completionTime)
                            : formatDuration(task.startTime)
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Task Details */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {selectedTask.title}
                <Badge className={getComplexityColor(selectedTask.complexity)}>
                  {selectedTask.complexity.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subtasks Details */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Subtasks Progress</h4>
                  <div className="space-y-3">
                    {selectedTask.subtasks.map((subtask, index) => (
                      <div key={subtask.id} className="surface-glass-subtle rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(subtask.status))} />
                            <span className="text-sm font-medium">{subtask.title}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {subtask.assignedAgent}
                          </Badge>
                        </div>
                        {subtask.result && (
                          <p className="text-xs text-muted-foreground">{subtask.result}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Agent Insights</h4>
                  <div className="space-y-2">
                    {selectedTask.insights.length === 0 ? (
                      <div className="text-center py-4">
                        <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {isSimulating ? 'Waiting for insights...' : 'Start collaboration to see insights'}
                        </p>
                      </div>
                    ) : (
                      selectedTask.insights.map((insight, index) => (
                        <div key={index} className="surface-glass-subtle rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                            <p className="text-sm text-foreground">{insight}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
