/**
 * User Profile Page
 * File: frontend/src/pages/UserProfilePage.tsx
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Common/Navbar'
import Loading from '../components/Common/Loading'
import PostCard from '../components/Feed/PostCard'
import Avatar from '../components/Common/Avatar'
import { connectionsService, Connection, User } from '../services/connections'
import { postsService } from '../services/posts'
import { useAuth } from '../context/AuthContext'
import type { Post } from '../types/post'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [allConnections, setAllConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [allUsers, userPosts, connections] = await Promise.all([
        connectionsService.getAllUsers(),
        postsService.getUserPosts(parseInt(userId!)),
        connectionsService.getConnections()
      ])

      const targetUser = allUsers.find((u) => u.id === parseInt(userId!))
      if (!targetUser) {
        setError('User not found')
        return
      }

      setProfileUser(targetUser)
      setPosts(userPosts)
      setAllConnections(connections)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load user profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionStatus = (): 'none' | 'pending_out' | 'pending_in' | 'connected' => {
    if (!profileUser || !currentUser) return 'none'

    const conn = allConnections.find(
      (c) =>
        (c.userId === currentUser.id && c.connectedUserId === profileUser.id) ||
        (c.connectedUserId === currentUser.id && c.userId === profileUser.id)
    )

    if (!conn) return 'none'
    if (conn.status === 'accepted') return 'connected'
    if (conn.userId === currentUser.id) return 'pending_out'
    return 'pending_in'
  }

  const getConnectionId = (): number | null => {
    if (!profileUser || !currentUser) return null

    const conn = allConnections.find(
      (c) =>
        (c.userId === currentUser.id && c.connectedUserId === profileUser.id) ||
        (c.connectedUserId === currentUser.id && c.userId === profileUser.id)
    )
    return conn?.id || null
  }

  const handleConnect = async () => {
    if (!profileUser) return

    try {
      setActionLoading(true)
      await connectionsService.createConnection(profileUser.id)
      alert('Connection request sent!')
      loadProfile()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send connection request')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnfriend = async () => {
    const connId = getConnectionId()
    if (!connId) return

    if (!confirm('Are you sure you want to remove this connection?')) return

    try {
      setActionLoading(true)
      await connectionsService.removeConnection(connId)
      loadProfile()
    } catch (err) {
      alert('Failed to remove connection')
    } finally {
      setActionLoading(false)
    }
  }

  const renderConnectionButton = () => {
    if (!profileUser || profileUser.id === currentUser?.id) return null

    const status = getConnectionStatus()

    if (status === 'connected') {
      return (
        <button
          onClick={handleUnfriend}
          disabled={actionLoading}
          className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {actionLoading ? 'Removing...' : 'Unfriend'}
        </button>
      )
    }

    if (status === 'pending_out') {
      return (
        <button
          disabled
          className="px-6 py-2 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
        >
          Request Pending
        </button>
      )
    }

    if (status === 'pending_in') {
      return (
        <button
          disabled
          className="px-6 py-2 bg-gray-400 text-white font-medium rounded-md cursor-not-allowed"
        >
          Pending (Check Connections)
        </button>
      )
    }

    return (
      <button
        onClick={handleConnect}
        disabled={actionLoading}
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {actionLoading ? 'Sending...' : 'Connect'}
      </button>
    )
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

  if (error || !profileUser) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error || 'User not found'}</p>
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
          {/* Profile Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  profilePictureUrl={profileUser.profilePictureUrl}
                  fullName={profileUser.fullName}
                  size="xlarge"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profileUser.fullName}</h1>
                  <p className="text-gray-600 mt-1">{profileUser.email}</p>
                  {profileUser.id === currentUser?.id && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      This is you
                    </span>
                  )}
                </div>
              </div>
              <div>{renderConnectionButton()}</div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {profileUser.id === currentUser?.id ? 'Your Posts' : `${profileUser.fullName}'s Posts`}
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              {profileUser.id === currentUser?.id
                ? 'You haven\'t posted anything yet'
                : 'This user hasn\'t posted anything yet'}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={loadProfile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
