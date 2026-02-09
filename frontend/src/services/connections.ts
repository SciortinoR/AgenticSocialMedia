/**
 * Connections API service
 * File: frontend/src/services/connections.ts
 */

import apiClient from './api'

export interface UserInfo {
  id: number
  email: string
  fullName: string
  profilePictureUrl?: string
}

export interface Connection {
  id: number
  userId: number
  connectedUserId: number
  connectionType: string
  status: 'pending' | 'accepted' | 'rejected'
  initiatedByAgent: boolean
  interactionFrequency: number
  createdAt: string
  updatedAt: string
  user?: UserInfo
  connectedUser?: UserInfo
}

export interface User {
  id: number
  email: string
  fullName: string
  profilePictureUrl?: string
  isActive: boolean
  createdAt: string
}

export const connectionsService = {
  /**
   * Get all connections for current user
   */
  async getConnections(statusFilter?: string): Promise<Connection[]> {
    const params = statusFilter ? { status_filter: statusFilter } : {}
    const response = await apiClient.get('/api/connections/', { params })
    return response.data
  },

  /**
   * Create a connection request
   */
  async createConnection(userId: number): Promise<Connection> {
    const response = await apiClient.post(`/api/connections/${userId}`)
    return response.data
  },

  /**
   * Accept a connection request
   */
  async acceptConnection(connectionId: number): Promise<Connection> {
    const response = await apiClient.put(`/api/connections/${connectionId}/accept`)
    return response.data
  },

  /**
   * Reject a connection request
   */
  async rejectConnection(connectionId: number): Promise<Connection> {
    const response = await apiClient.put(`/api/connections/${connectionId}/reject`)
    return response.data
  },

  /**
   * Remove a connection
   */
  async removeConnection(connectionId: number): Promise<void> {
    await apiClient.delete(`/api/connections/${connectionId}`)
  },

  /**
   * Get all users (for browsing)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/auth/users')
    return response.data
  },
}
