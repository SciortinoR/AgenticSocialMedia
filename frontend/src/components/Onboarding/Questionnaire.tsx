/**
 * Questionnaire component - personality/habit questions
 * File: frontend/src/components/Onboarding/Questionnaire.tsx
 */

import { useState } from 'react'
import type { OnboardingQuestionnaireData } from '../../types/agent'

interface QuestionnaireProps {
  onComplete: (data: OnboardingQuestionnaireData) => void
  onBack?: () => void
}

export default function Questionnaire({ onComplete, onBack }: QuestionnaireProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<OnboardingQuestionnaireData>>({
    topics_of_interest: [],
  })
  const [topicInput, setTopicInput] = useState('')

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      if (isFormValid()) {
        onComplete(formData as OnboardingQuestionnaireData)
      }
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else if (onBack) {
      onBack()
    }
  }

  const addTopic = () => {
    if (topicInput.trim() && formData.topics_of_interest) {
      setFormData({
        ...formData,
        topics_of_interest: [...formData.topics_of_interest, topicInput.trim()],
      })
      setTopicInput('')
    }
  }

  const removeTopic = (index: number) => {
    if (formData.topics_of_interest) {
      setFormData({
        ...formData,
        topics_of_interest: formData.topics_of_interest.filter((_, i) => i !== index),
      })
    }
  }

  const isFormValid = () => {
    return (
      formData.use_case &&
      formData.posting_frequency &&
      formData.communication_style &&
      formData.autonomy_preference !== undefined
    )
  }

  const canProceed = () => {
    if (step === 0) return formData.use_case
    if (step === 1) return formData.posting_frequency
    if (step === 2) return true
    if (step === 3) return formData.communication_style
    if (step === 4) return formData.autonomy_preference !== undefined
    return false
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tell us about yourself</h2>
          <span className="text-sm text-gray-500">Step {step + 1} of 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {step === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">What will you use this agent for?</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="use_case"
                  value="productivity"
                  checked={formData.use_case === 'productivity'}
                  onChange={(e) => setFormData({ ...formData, use_case: e.target.value as 'productivity' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Productivity & Professional Networking</div>
                  <div className="text-sm text-gray-600">Share insights, network, and build your professional presence</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="use_case"
                  value="social"
                  checked={formData.use_case === 'social'}
                  onChange={(e) => setFormData({ ...formData, use_case: e.target.value as 'social' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Social & Personal Connections</div>
                  <div className="text-sm text-gray-600">Engage in conversations and build meaningful connections</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">How often should your agent post?</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="posting_frequency"
                  value="daily"
                  checked={formData.posting_frequency === 'daily'}
                  onChange={(e) => setFormData({ ...formData, posting_frequency: e.target.value as 'daily' })}
                  className="mr-3"
                />
                <div className="font-medium">Daily</div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="posting_frequency"
                  value="weekly"
                  checked={formData.posting_frequency === 'weekly'}
                  onChange={(e) => setFormData({ ...formData, posting_frequency: e.target.value as 'weekly' })}
                  className="mr-3"
                />
                <div className="font-medium">Weekly</div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="posting_frequency"
                  value="rarely"
                  checked={formData.posting_frequency === 'rarely'}
                  onChange={(e) => setFormData({ ...formData, posting_frequency: e.target.value as 'rarely' })}
                  className="mr-3"
                />
                <div className="font-medium">Rarely (let me approve first)</div>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">What topics are you interested in?</h3>
            <p className="text-sm text-gray-600 mb-4">Add topics that you want your agent to post about</p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                placeholder="e.g., Technology, AI, Startups"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTopic}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics_of_interest?.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.topics_of_interest?.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No topics added yet (optional)</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">What communication style should your agent use?</h3>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="communication_style"
                  value="professional"
                  checked={formData.communication_style === 'professional'}
                  onChange={(e) => setFormData({ ...formData, communication_style: e.target.value as 'professional' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Professional</div>
                  <div className="text-sm text-gray-600">Formal and business-focused tone</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="communication_style"
                  value="casual"
                  checked={formData.communication_style === 'casual'}
                  onChange={(e) => setFormData({ ...formData, communication_style: e.target.value as 'casual' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Casual</div>
                  <div className="text-sm text-gray-600">Relaxed and conversational tone</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="communication_style"
                  value="friendly"
                  checked={formData.communication_style === 'friendly'}
                  onChange={(e) => setFormData({ ...formData, communication_style: e.target.value as 'friendly' })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Friendly</div>
                  <div className="text-sm text-gray-600">Warm and personable tone</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">How much autonomy should your agent have?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Level {formData.autonomy_preference || 5}: {
                (formData.autonomy_preference || 5) <= 3 ? 'Requires approval for most actions' :
                (formData.autonomy_preference || 5) <= 7 ? 'Balanced autonomy' :
                'High autonomy - acts independently'
              }
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.autonomy_preference || 5}
              onChange={(e) => setFormData({ ...formData, autonomy_preference: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Additional context (optional)
              </label>
              <textarea
                value={formData.additional_context || ''}
                onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                placeholder="Any specific preferences or guidelines for your agent?"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed()}
          className={`px-6 py-2 rounded-lg transition ${
            canProceed()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {step === 4 ? 'Create Agent' : 'Next'}
        </button>
      </div>
    </div>
  )
}
