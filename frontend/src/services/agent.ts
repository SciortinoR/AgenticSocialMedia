/**
 * Agent API service
 * File: frontend/src/services/agent.ts
 */

import apiClient from './api'
import type { Agent, AgentConfig, AgentDashboard, AgentAction } from '../types/agent'

export const agentService = {
  /**
   * Create agent for current user
   */
  async createAgent(onboardingData: Record<string, any>): Promise<Agent> {
    const response = await apiClient.post('/api/agents/', onboardingData)
    return response.data
  },

  /**
   * Get current user's agent
   */
  async getMyAgent(): Promise<Agent> {
    const response = await apiClient.get('/api/agents/me')
    return response.data
  },

  /**
   * Update agent configuration
   */
  async updateAgent(config: Partial<AgentConfig>): Promise<Agent> {
    const response = await apiClient.put('/api/agents/me', config)
    return response.data
  },

  /**
   * Get agent dashboard data
   */
  async getDashboard(): Promise<AgentDashboard> {
    const response = await apiClient.get('/api/agents/me/dashboard')
    return response.data
  },

  /**
   * Generate content for agent
   */
  async generateContent(): Promise<any> {
    const response = await apiClient.post('/api/agents/me/generate-content')
    return response.data
  },

  /**
   * Approve agent action
   */
  async approveAction(actionId: number): Promise<any> {
    const response = await apiClient.post(`/api/agents/me/actions/${actionId}/approve`)
    return response.data
  },

  /**
   * Reject agent action
   */
  async rejectAction(actionId: number): Promise<void> {
    await apiClient.post(`/api/agents/me/actions/${actionId}/reject`)
  },

  /**
   * Get agent action history
   */
  async getActions(_skip: number = 0, _limit: number = 20): Promise<AgentAction[]> {
    // TODO: Implement get actions
    // const response = await apiClient.get('/api/agents/me/actions', { params: { skip, limit } })
    // return response.data
    throw new Error('Not implemented')
  },

  /**
   * Delete an agent action
   */
  async deleteAction(_actionId: number): Promise<void> {
    // TODO: Implement delete action
    // await apiClient.delete(`/api/agents/me/actions/${actionId}`)
  },

  /**
   * Edit an agent action
   */
  async editAction(_actionId: number, _newContent: string): Promise<AgentAction> {
    // TODO: Implement edit action
    // const response = await apiClient.put(`/api/agents/me/actions/${actionId}`, { content: newContent })
    // return response.data
    throw new Error('Not implemented')
  },

  /**
   * Add directive for agent
   */
  async addDirective(_directive: string): Promise<void> {
    // TODO: Implement add directive
    // await apiClient.post('/api/agents/me/directives', { directive })
  },
}
