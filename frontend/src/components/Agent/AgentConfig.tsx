/**
 * AgentConfig component - agent configuration form
 * File: frontend/src/components/Agent/AgentConfig.tsx
 */

import { useState, useEffect } from 'react'
import type { Agent } from '../../types/agent'

interface AgentConfigProps {
  agent: Agent
  onUpdate: () => void
}

export default function AgentConfig({ agent, onUpdate }: AgentConfigProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: agent.name,
    systemPrompt: agent.systemPrompt,
    autonomyLevel: agent.autonomyLevel,
    isActive: agent.isActive,
    communicationStyle: agent.personalityData?.communication_style || 'casual',
    topicsOfInterest: agent.personalityData?.topics_of_interest?.join(', ') || '',
    postingFrequency: agent.preferences?.posting_frequency || 'daily',
  })

  useEffect(() => {
    setFormData({
      name: agent.name,
      systemPrompt: agent.systemPrompt,
      autonomyLevel: agent.autonomyLevel,
      isActive: agent.isActive,
      communicationStyle: agent.personalityData?.communication_style || 'casual',
      topicsOfInterest: agent.personalityData?.topics_of_interest?.join(', ') || '',
      postingFrequency: agent.preferences?.posting_frequency || 'daily',
    })
  }, [agent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { agentService } = await import('../../services/agent')

      const topicsArray = formData.topicsOfInterest
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0)

      // Send data in snake_case format that backend expects
      const updateData = {
        name: formData.name,
        system_prompt: formData.systemPrompt,
        autonomy_level: formData.autonomyLevel,
        is_active: formData.isActive,
        personality_data: {
          ...agent.personalityData,
          communication_style: formData.communicationStyle,
          topics_of_interest: topicsArray,
        },
        preferences: {
          ...agent.preferences,
          posting_frequency: formData.postingFrequency,
        },
      }

      await agentService.updateAgent(updateData)

      setSuccess(true)
      setIsEditing(false)
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to update agent configuration')
      console.error('Error updating agent:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: agent.name,
      systemPrompt: agent.systemPrompt,
      autonomyLevel: agent.autonomyLevel,
      isActive: agent.isActive,
      communicationStyle: agent.personalityData?.communication_style || 'casual',
      topicsOfInterest: agent.personalityData?.topics_of_interest?.join(', ') || '',
      postingFrequency: agent.preferences?.posting_frequency || 'daily',
    })
    setIsEditing(false)
    setError(null)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Agent Configuration</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Configuration
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">Configuration updated successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agent Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Agent Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="mt-1 text-sm text-gray-500">The display name for your agent</p>
        </div>

        {/* System Prompt */}
        <div>
          <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            rows={8}
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Instructions that guide your agent's behavior and personality
          </p>
        </div>

        {/* Autonomy Level */}
        <div>
          <label htmlFor="autonomyLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Autonomy Level: {formData.autonomyLevel}/10
          </label>
          <input
            type="range"
            id="autonomyLevel"
            min="1"
            max="10"
            value={formData.autonomyLevel}
            onChange={(e) => setFormData({ ...formData, autonomyLevel: parseInt(e.target.value) })}
            disabled={!isEditing}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Ask permission (1)</span>
            <span>Fully autonomous (10)</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {formData.autonomyLevel < 7
              ? 'Agent will ask for approval before posting'
              : 'Agent will post automatically without approval'}
          </p>
        </div>

        {/* Communication Style */}
        <div>
          <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 mb-2">
            Communication Style
          </label>
          <select
            id="communicationStyle"
            value={formData.communicationStyle}
            onChange={(e) => setFormData({ ...formData, communicationStyle: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">How your agent communicates on social media</p>
        </div>

        {/* Topics of Interest */}
        <div>
          <label htmlFor="topicsOfInterest" className="block text-sm font-medium text-gray-700 mb-2">
            Topics of Interest
          </label>
          <input
            type="text"
            id="topicsOfInterest"
            value={formData.topicsOfInterest}
            onChange={(e) => setFormData({ ...formData, topicsOfInterest: e.target.value })}
            disabled={!isEditing}
            placeholder="AI, technology, innovation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="mt-1 text-sm text-gray-500">Comma-separated list of topics your agent cares about</p>
        </div>

        {/* Posting Frequency */}
        <div>
          <label htmlFor="postingFrequency" className="block text-sm font-medium text-gray-700 mb-2">
            Posting Frequency
          </label>
          <select
            id="postingFrequency"
            value={formData.postingFrequency}
            onChange={(e) => setFormData({ ...formData, postingFrequency: e.target.value })}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="rarely">Rarely</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">How often your agent should post content</p>
        </div>

        {/* Agent Status */}
        <div>
          <label htmlFor="isActive" className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={!isEditing}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Agent is active</span>
          </label>
          <p className="mt-1 ml-6 text-sm text-gray-500">
            {formData.isActive ? 'Agent is enabled and can take actions' : 'Agent is paused'}
          </p>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
