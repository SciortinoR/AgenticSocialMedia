/**
 * User type definitions
 * File: frontend/src/types/user.ts
 */

export interface User {
  id: number
  email: string
  fullName: string
  bio?: string
  profilePictureUrl?: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  // TODO: Add additional profile fields
  // connectionCount?: number
  // postCount?: number
}

export interface UpdateProfileData {
  fullName?: string
  bio?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  fullName: string
}
