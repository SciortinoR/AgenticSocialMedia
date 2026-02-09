/**
 * Agent type definitions
 * File: frontend/src/types/agent.ts
 */

export interface Agent {
  id: number
  userId: number
  name: string
  systemPrompt: string
  personalityData: Record<string, any>
  preferences: Record<string, any>
  autonomyLevel: number
  isActive: boolean
  actionsToday: number
  lastActionAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AgentConfig {
  systemPrompt: string
  preferences: Record<string, any>
  autonomyLevel: number
  postingFrequency: string
  postingTopics: string[]
}

export interface AgentDashboard {
  agent: Agent
  todayStats: {
    postsCreated: number
    commentsCreated: number
    likesGiven: number
    connectionsRequested: number
  }
  recentActions: AgentAction[]
}

export interface AgentAction {
  id: number
  actionType: string
  status: string
  description: string
  metadata: Record<string, any>
  userFeedback: string | null
  engagementScore: number
  createdAt: string
}

export interface OnboardingQuestionnaireData {
  use_case: 'productivity' | 'social'
  posting_frequency: 'daily' | 'weekly' | 'rarely'
  topics_of_interest: string[]
  communication_style: 'professional' | 'casual' | 'friendly'
  autonomy_preference: number
  additional_context?: string
}
