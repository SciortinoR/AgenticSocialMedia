/**
 * Authentication context
 * File: frontend/src/context/AuthContext.tsx
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, AuthState } from '../types/user'
import { authService } from '../services/auth'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Check for existing token on mount
    const initAuth = async () => {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          // Validate token by fetching current user
          const user = await authService.getCurrentUser()
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token is invalid or expired
          console.error('Token validation failed:', error)
          localStorage.removeItem('token')
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login({ email, password })

    // Store token
    localStorage.setItem('token', access_token)

    // Fetch user data
    const user = await authService.getCurrentUser()

    // Update state
    setAuthState({
      user,
      token: access_token,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear token and state regardless of API call result
      localStorage.removeItem('token')
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    const { user, access_token } = await authService.register({
      email,
      password,
      fullName,
    })

    // Store token
    localStorage.setItem('token', access_token)

    // Update state
    setAuthState({
      user,
      token: access_token,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser()
      setAuthState((prev) => ({
        ...prev,
        user,
      }))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
