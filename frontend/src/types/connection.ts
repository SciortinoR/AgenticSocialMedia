/**
 * Connection type definitions
 * File: frontend/src/types/connection.ts
 */

export type ConnectionType = 'close_friend' | 'friend' | 'acquaintance' | 'professional'
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected'

export interface Connection {
  id: number
  userId: number
  connectedUserId: number
  connectionType: ConnectionType
  status: ConnectionStatus
  initiatedByAgent: boolean
  interactionFrequency: number
  createdAt: string
  updatedAt: string
  connectedUser: {
    id: number
    fullName: string
    email: string
  }
}

export interface ConnectionSuggestion {
  userId: number
  fullName: string
  email: string
  score: number
  reason: string
}
