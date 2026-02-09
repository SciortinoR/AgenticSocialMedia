/**
 * Authentication API service
 * File: frontend/src/services/auth.ts
 */

import apiClient from './api'
import type { User, LoginCredentials, SignupData, UpdateProfileData } from '../types/user'

export const authService = {
  /**
   * Register a new user
   */
  async register(data: SignupData): Promise<{ user: User; access_token: string }> {
    const response = await apiClient.post('/api/auth/register', data)
    return response.data
  },

  /**
   * Login with email and password
   * Note: FastAPI OAuth2PasswordRequestForm expects form data
   */
  async login(credentials: LoginCredentials): Promise<{ access_token: string; token_type: string }> {
    // Convert to form data for OAuth2PasswordRequestForm
    const formData = new FormData()
    formData.append('username', credentials.email)  // OAuth2 uses 'username' field
    formData.append('password', credentials.password)

    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
    localStorage.removeItem('token')
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put('/api/auth/me', data)
    return response.data
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/api/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Initialize Google OAuth flow (Phase 5)
   */
  async initiateGoogleOAuth(): Promise<string> {
    const response = await apiClient.get('/api/auth/google')
    return response.data.authUrl
  },

  /**
   * Initialize Instagram OAuth flow (Phase 5)
   */
  async initiateInstagramOAuth(): Promise<string> {
    const response = await apiClient.get('/api/auth/instagram')
    return response.data.authUrl
  },
}
