/**
 * Feed component - displays posts from connections
 * File: frontend/src/components/Feed/Feed.tsx
 */

import { useState, useEffect } from 'react'
import PostCard from './PostCard'
import Loading from '../Common/Loading'
import { postsService } from '../../services/posts'
import type { Post } from '../../types/post'

interface FeedProps {
  type?: 'personalized' | 'global'
}

export default function Feed({ type = 'personalized' }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeed()
  }, [type])

  const loadFeed = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const feedPosts =
        type === 'global'
          ? await postsService.getGlobalFeed()
          : await postsService.getFeed()

      setPosts(feedPosts)
    } catch (err: any) {
      console.error('Failed to load feed:', err)
      setError(err.response?.data?.detail || 'Failed to load feed')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostUpdate = async (postId: number) => {
    try {
      const updatedPost = await postsService.getPost(postId)
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)))
    } catch (err: any) {
      console.error('Failed to refresh post:', err)
      // If post was deleted or not found, remove it from the list
      if (err.response?.status === 404) {
        setPosts(posts.filter((p) => p.id !== postId))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadFeed}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">
          {type === 'global'
            ? 'No posts yet. Be the first to post!'
            : "No posts in your feed yet. Connect with other users to see their posts!"}
        </p>
        {type === 'personalized' && (
          <a
            href="/connections"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Find Connections
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdate={() => handlePostUpdate(post.id)} />
      ))}
    </div>
  )
}
