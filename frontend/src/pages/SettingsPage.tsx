/**
 * Settings page
 * File: frontend/src/pages/SettingsPage.tsx
 */

import { useState, useEffect } from 'react'
import Navbar from '../components/Common/Navbar'
import AgentConfig from '../components/Agent/AgentConfig'
import UserProfile from '../components/User/UserProfile'
import Loading from '../components/Common/Loading'
import { agentService } from '../services/agent'
import { useAuth } from '../context/AuthContext'
import type { Agent } from '../types/agent'

type TabType = 'profile' | 'agent'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAgent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const agentData = await agentService.getMyAgent()
      setAgent(agentData)
    } catch (err) {
      console.error('Error loading agent:', err)
      setError('Failed to load agent configuration')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAgent()
  }, [])

  const handleAgentUpdate = () => {
    loadAgent()
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loading />
        </div>
      </>
    )
  }

  if (error || !agent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error || 'Agent not found'}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">Manage your profile and agent configuration</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className={`${
                  activeTab === 'agent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Agent Configuration
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && user && (
            <UserProfile user={user} onUpdate={refreshUser} />
          )}
          {activeTab === 'agent' && agent && (
            <AgentConfig agent={agent} onUpdate={handleAgentUpdate} />
          )}
        </div>
      </div>
    </>
  )
}
