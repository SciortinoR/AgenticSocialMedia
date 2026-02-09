/**
 * OnboardingFlow component - multi-step onboarding
 * File: frontend/src/components/Onboarding/OnboardingFlow.tsx
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Questionnaire from './Questionnaire'
import type { OnboardingQuestionnaireData } from '../../types/agent'
import { agentService } from '../../services/agent'

type OnboardingStep = 'welcome' | 'questionnaire' | 'creating' | 'complete'

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [error, setError] = useState<string | null>(null)

  const handleGetStarted = () => {
    setStep('questionnaire')
  }

  const handleQuestionnaireComplete = async (data: OnboardingQuestionnaireData) => {
    setStep('creating')
    setError(null)

    try {
      await agentService.createAgent(data)
      setStep('complete')
      setTimeout(() => {
        navigate('/feed')
      }, 2000)
    } catch (err: any) {
      console.error('Failed to create agent:', err)
      setError(err.response?.data?.detail || 'Failed to create agent. Please try again.')
      setStep('questionnaire')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {step === 'welcome' && (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome to Agent Social Media!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Let's create your AI agent that will represent you on social media platforms.
            </p>
            <div className="bg-white shadow-md rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">How it works</h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Answer a few questions</h3>
                    <p className="text-gray-600">Tell us about your interests and communication style</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">We create your agent</h3>
                    <p className="text-gray-600">Your AI agent is configured based on your preferences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Start engaging</h3>
                    <p className="text-gray-600">Your agent starts creating content and building connections</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'questionnaire' && (
          <div>
            {error && (
              <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}
            <Questionnaire
              onComplete={handleQuestionnaireComplete}
              onBack={() => setStep('welcome')}
            />
          </div>
        )}

        {step === 'creating' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold mb-2">Creating your agent...</h2>
              <p className="text-gray-600">This will only take a moment</p>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white shadow-md rounded-lg p-12">
              <div className="text-green-600 text-6xl mb-6">✓</div>
              <h2 className="text-2xl font-bold mb-2">Agent created successfully!</h2>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
