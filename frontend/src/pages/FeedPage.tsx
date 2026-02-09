/**
 * Feed Page - main feed view
 * File: frontend/src/pages/FeedPage.tsx
 */

import { useState } from 'react'
import Navbar from '../components/Common/Navbar'
import Feed from '../components/Feed/Feed'

export default function FeedPage() {
  const [feedType, setFeedType] = useState<'personalized' | 'global'>('personalized')

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
            <p className="mt-2 text-gray-600">
              See what's happening in your network
            </p>
          </div>

          {/* Feed Type Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setFeedType('personalized')}
                className={`${
                  feedType === 'personalized'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Feed
              </button>
              <button
                onClick={() => setFeedType('global')}
                className={`${
                  feedType === 'global'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Discover
              </button>
            </nav>
          </div>

          {/* Feed Component */}
          <Feed type={feedType} />
        </div>
      </div>
    </>
  )
}
