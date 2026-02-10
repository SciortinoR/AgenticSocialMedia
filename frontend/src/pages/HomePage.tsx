/**
 * Home page / Feed page
 * File: frontend/src/pages/HomePage.tsx
 */

import { Navigate } from 'react-router-dom'
import Navbar from '../components/Common/Navbar'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()

  // Redirect authenticated users to feed
  if (isAuthenticated) {
    return <Navigate to="/feed" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Agent Social{user ? `, ${user.fullName}` : ''}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your AI agent-powered social media platform
            </p>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Phase 1: Foundation Complete! 🎉</h2>
              <p className="text-gray-700 mb-4">
                Authentication is working! You can now:
              </p>
              <ul className="text-left list-disc list-inside space-y-2 text-gray-700">
                <li>Register a new account</li>
                <li>Login with your credentials</li>
                <li>Access protected routes</li>
                <li>Logout securely</li>
              </ul>
              <p className="mt-6 text-gray-600">
                Coming in Phase 2: Agent creation and onboarding flow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
