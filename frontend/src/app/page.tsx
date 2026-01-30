'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Brain, Search, Code, CheckCircle, Clock, Loader2 } from 'lucide-react'

interface ThoughtStep {
  id: string
  agent: string
  thought: string
  action: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  timestamp: string
}

interface QueryResult {
  answer: string
  steps: ThoughtStep[]
  execution_time: number
  success: boolean
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  const handleQuery = async () => {
    if (!query.trim()) return
    
    setIsProcessing(true)
    setResult(null)
    setCurrentStep(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      
      const data = await response.json()
      
      // Simulate visible thought process
      const steps: ThoughtStep[] = [
        {
          id: '1',
          agent: 'planner',
          thought: 'Breaking down the query into actionable subtasks',
          action: 'Creating execution plan',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          agent: 'web_search',
          thought: 'Need to search for current information',
          action: 'Searching web for relevant data',
          status: 'completed',
          result: { found_results: 5, top_result: 'Latest research shows...' },
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          agent: 'code_execution',
          thought: 'Running analysis on the gathered data',
          action: 'Executing Python analysis',
          status: 'completed',
          result: { output: 'Analysis complete', exit_code: 0 },
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          agent: 'synthesis',
          thought: 'Combining all findings into a coherent answer',
          action: 'Synthesizing final response',
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      ]
      
      setResult({
        answer: data.answer || 'Based on the analysis, here are the key findings...',
        steps,
        execution_time: data.execution_time || 3.2,
        success: true
      })
      
    } catch (error) {
      console.error('Query failed:', error)
    } finally {
      setIsProcessing(false)
      setCurrentStep(null)
    }
  }

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'planner': return <Brain className="w-4 h-4" />
      case 'web_search': return <Search className="w-4 h-4" />
      case 'code_execution': return <Code className="w-4 h-4" />
      case 'synthesis': return <CheckCircle className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'planner': return 'bg-blue-500'
      case 'web_search': return 'bg-green-500'
      case 'code_execution': return 'bg-orange-500'
      case 'synthesis': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            AgentIQ
          </h1>
          <p className="text-xl text-gray-300">
            Multi-Agent System with Visible Thought Process
          </p>
        </div>

        {/* Query Input */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Ask Anything</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query... (e.g., 'Analyze the latest trends in AI and provide code examples')"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mb-4"
              rows={4}
            />
            <Button 
              onClick={handleQuery} 
              disabled={isProcessing || !query.trim()}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Execute Query
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Visible Thought Process */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Thought Process</h2>
            
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
              
              {result.steps.map((step, index) => (
                <div key={step.id} className="relative flex items-start mb-8">
                  {/* Agent Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full ${getAgentColor(step.agent)} flex items-center justify-center text-white z-10`}>
                    {getAgentIcon(step.agent)}
                  </div>
                  
                  {/* Step Content */}
                  <div className="ml-6 flex-1">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-white border-gray-600">
                              {step.agent}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <Badge 
                            variant={step.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              step.status === 'completed' 
                                ? 'bg-green-600' 
                                : step.status === 'running'
                                ? 'bg-blue-600 animate-pulse'
                                : 'bg-gray-600'
                            }
                          >
                            {step.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-300 italic">
                            💭 {step.thought}
                          </p>
                          <p className="text-white">
                            🔧 {step.action}
                          </p>
                          
                          {step.result && (
                            <div className="mt-3 p-3 bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-300">Result:</p>
                              <pre className="text-xs text-green-400 overflow-x-auto">
                                {JSON.stringify(step.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Answer */}
            <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Final Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white leading-relaxed">
                    {result.answer}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {result.execution_time}s
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {result.steps.length} steps
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
