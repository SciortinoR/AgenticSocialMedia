/**
 * Agent Dashboard page
 * File: frontend/src/pages/DashboardPage.tsx
 */

import { useState, useEffect } from 'react'
import Navbar from '../components/Common/Navbar'
import PostCard from '../components/Feed/PostCard'
import { useAuth } from '../context/AuthContext'
import { agentService } from '../services/agent'
import { postsService } from '../services/posts'
import type { Agent } from '../types/agent'
import type { Post } from '../types/post'

export default function DashboardPage() {
  const { user: _user } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [agentData, postsData] = await Promise.all([
        agentService.getMyAgent(),
        postsService.getPosts(),
      ])
      setAgent(agentData)
      setPosts(postsData)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      setError(err.response?.data?.detail || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    try {
      setIsCreatingPost(true)
      const newPost = await postsService.createPost({ content: newPostContent })
      setPosts([newPost, ...posts])
      setNewPostContent('')
    } catch (err: any) {
      console.error('Failed to create post:', err)
      alert('Failed to create post')
    } finally {
      setIsCreatingPost(false)
    }
  }

  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditingPostId(postId)
      setEditContent(post.content)
    }
  }

  const handleSaveEdit = async (postId: number) => {
    if (!editContent.trim()) return

    try {
      const updatedPost = await postsService.updatePost(postId, { content: editContent })
      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)))
      setEditingPostId(null)
      setEditContent('')
    } catch (err: any) {
      console.error('Failed to update post:', err)
      alert('Failed to update post')
    }
  }

  const handleDeletePost = async (postId: number) => {
    try {
      await postsService.deletePost(postId)
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err: any) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post')
    }
  }

  const handlePostUpdate = async (postId: number) => {
    try {
      const updatedPost = await postsService.getPost(postId)
      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)))
    } catch (err: any) {
      console.error('Failed to refresh post:', err)
    }
  }

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true)
      const newPost = await agentService.generateContent()
      setPosts([newPost, ...posts])
    } catch (err: any) {
      console.error('Failed to generate content:', err)
      alert('Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprovePost = async (postId: number) => {
    try {
      const updatedPost = await postsService.updatePost(postId, { status: 'published' })
      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)))
    } catch (err: any) {
      console.error('Failed to approve post:', err)
      alert('Failed to approve post')
    }
  }

  const handleSaveAndPublish = async (postId: number) => {
    if (!editContent.trim()) return

    try {
      const updatedPost = await postsService.updatePost(postId, {
        content: editContent,
        status: 'published'
      })
      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)))
      setEditingPostId(null)
      setEditContent('')
    } catch (err: any) {
      console.error('Failed to save and publish post:', err)
      alert('Failed to save and publish post')
    }
  }

  const draftPosts = posts.filter(p => p.status === 'draft' && p.postType === 'agent')
  const publishedPosts = posts.filter(p => p.status === 'published')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Agent Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Agent Status</h3>
            <p className="text-3xl font-bold text-blue-600">
              {agent?.isActive ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-gray-600 mt-2">{agent?.name}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Autonomy Level</h3>
            <p className="text-3xl font-bold text-purple-600">{agent?.autonomyLevel}/10</p>
            <p className="text-sm text-gray-600 mt-2">Agent independence</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Actions Today</h3>
            <p className="text-3xl font-bold text-green-600">{agent?.actionsToday || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Automated actions</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Content</h2>
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Let Agent Generate</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's on your mind? (Or let your agent generate content)"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            rows={4}
          />
          <button
            onClick={handleCreatePost}
            disabled={isCreatingPost || !newPostContent.trim()}
            className={`px-6 py-2 rounded-lg transition ${
              isCreatingPost || !newPostContent.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCreatingPost ? 'Creating...' : 'Post Manually'}
          </button>
        </div>

        {draftPosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖 Pending Agent Posts</span>
              <span className="text-sm font-normal text-gray-600">
                ({draftPosts.length} waiting for approval)
              </span>
            </h2>
            <div className="space-y-4">
              {draftPosts.map((post) => (
                <div key={post.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                  {editingPostId === post.id ? (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <div className="font-semibold">Editing Agent Post</div>
                            <div className="text-sm text-gray-600">Make your changes below</div>
                          </div>
                        </div>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        rows={4}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => handleSaveAndPublish(post.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          ✓ Save & Publish
                        </button>
                        <button
                          onClick={() => {
                            setEditingPostId(null)
                            setEditContent('')
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <div className="font-semibold">Your Agent Generated This</div>
                            <div className="text-sm text-gray-600">Waiting for your approval</div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprovePost(post.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          ✓ Approve & Publish
                        </button>
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          ✎ Edit First
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Published Posts</h2>
          {publishedPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No published posts yet. Create your first post or let your agent generate one!
            </div>
          ) : (
            <div>
              {publishedPosts.map((post) => (
                <div key={post.id}>
                  {editingPostId === post.id ? (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPostId(null)
                            setEditContent('')
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PostCard
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onUpdate={() => handlePostUpdate(post.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
