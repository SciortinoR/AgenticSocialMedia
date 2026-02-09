/**
 * Connections page
 * File: frontend/src/pages/ConnectionsPage.tsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Common/Navbar'
import Loading from '../components/Common/Loading'
import Avatar from '../components/Common/Avatar'
import { connectionsService, Connection, User } from '../services/connections'
import { useAuth } from '../context/AuthContext'

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse' | 'pending' | 'accepted'>('browse')
  const [users, setUsers] = useState<User[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [allConnections, setAllConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (activeTab === 'browse') {
        const [allUsers, allConns] = await Promise.all([
          connectionsService.getAllUsers(),
          connectionsService.getConnections()
        ])
        setUsers(allUsers)
        setAllConnections(allConns)
      } else {
        const statusFilter = activeTab === 'pending' ? 'pending' : 'accepted'
        const conns = await connectionsService.getConnections(statusFilter)
        setConnections(conns)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionStatus = (userId: number): 'none' | 'pending_out' | 'pending_in' | 'connected' => {
    const conn = allConnections.find(
      (c) =>
        (c.userId === user?.id && c.connectedUserId === userId) ||
        (c.connectedUserId === user?.id && c.userId === userId)
    )

    if (!conn) return 'none'
    if (conn.status === 'accepted') return 'connected'
    if (conn.userId === user?.id) return 'pending_out'
    return 'pending_in'
  }

  const getConnectionId = (userId: number): number | null => {
    const conn = allConnections.find(
      (c) =>
        (c.userId === user?.id && c.connectedUserId === userId) ||
        (c.connectedUserId === user?.id && c.userId === userId)
    )
    return conn?.id || null
  }

  const handleConnect = async (userId: number) => {
    try {
      setActionLoading(userId)
      await connectionsService.createConnection(userId)
      alert('Connection request sent!')
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send connection request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAccept = async (connectionId: number) => {
    try {
      setActionLoading(connectionId)
      await connectionsService.acceptConnection(connectionId)
      loadData()
    } catch (err) {
      alert('Failed to accept connection')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (connectionId: number) => {
    try {
      setActionLoading(connectionId)
      await connectionsService.rejectConnection(connectionId)
      loadData()
    } catch (err) {
      alert('Failed to reject connection')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (connectionId: number) => {
    if (!confirm('Are you sure you want to remove this connection?')) return

    try {
      setActionLoading(connectionId)
      await connectionsService.removeConnection(connectionId)
      loadData()
    } catch (err) {
      alert('Failed to remove connection')
    } finally {
      setActionLoading(null)
    }
  }

  const renderConnectionButton = (targetUser: User) => {
    const status = getConnectionStatus(targetUser.id)
    const connId = getConnectionId(targetUser.id)

    if (status === 'connected') {
      return (
        <button
          onClick={() => connId && handleRemove(connId)}
          disabled={actionLoading === connId}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading === connId ? 'Removing...' : 'Unfriend'}
        </button>
      )
    }

    if (status === 'pending_out') {
      return (
        <button
          onClick={() => connId && handleRemove(connId)}
          disabled={actionLoading === connId}
          className="px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-md cursor-not-allowed"
        >
          Pending
        </button>
      )
    }

    if (status === 'pending_in') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-md cursor-not-allowed"
        >
          Pending (Incoming)
        </button>
      )
    }

    return (
      <button
        onClick={() => handleConnect(targetUser.id)}
        disabled={actionLoading === targetUser.id}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {actionLoading === targetUser.id ? 'Sending...' : 'Connect'}
      </button>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
            <p className="mt-2 text-gray-600">Browse users and manage your connections</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('browse')}
                className={`${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Browse Users
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending Requests
              </button>
              <button
                onClick={() => setActiveTab('accepted')}
                className={`${
                  activeTab === 'accepted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Connections
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : (
            <>
              {/* Browse Users Tab */}
              {activeTab === 'browse' && (
                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No other users found
                    </div>
                  ) : (
                    users.map((targetUser) => (
                      <div
                        key={targetUser.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar
                            profilePictureUrl={targetUser.profilePictureUrl}
                            fullName={targetUser.fullName}
                            size="medium"
                          />
                          <div>
                            <Link
                              to={`/users/${targetUser.id}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              {targetUser.fullName}
                            </Link>
                            <p className="text-sm text-gray-500">{targetUser.email}</p>
                          </div>
                        </div>
                        {renderConnectionButton(targetUser)}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pending Requests Tab */}
              {activeTab === 'pending' && (
                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                  {connections.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No pending connection requests
                    </div>
                  ) : (
                    connections.map((conn) => {
                      const isIncoming = conn.connectedUserId === user?.id
                      const otherUser = isIncoming ? conn.user : conn.connectedUser

                      return (
                        <div
                          key={conn.id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar
                              profilePictureUrl={otherUser?.profilePictureUrl}
                              fullName={otherUser?.fullName || 'Unknown User'}
                              size="medium"
                            />
                            <div>
                              <div>
                                <Link
                                  to={`/users/${otherUser?.id}`}
                                  className="font-medium text-blue-600 hover:text-blue-800"
                                >
                                  {otherUser?.fullName || 'Unknown User'}
                                </Link>
                                {isIncoming && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Incoming
                                  </span>
                                )}
                                {!isIncoming && (
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    Outgoing
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                Type: {conn.connectionType} • Requested{' '}
                                {new Date(conn.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isIncoming ? (
                              <>
                                <button
                                  onClick={() => handleAccept(conn.id)}
                                  disabled={actionLoading === conn.id}
                                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(conn.id)}
                                  disabled={actionLoading === conn.id}
                                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRemove(conn.id)}
                                disabled={actionLoading === conn.id}
                                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* My Connections Tab */}
              {activeTab === 'accepted' && (
                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                  {connections.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No connections yet. Browse users to connect!
                    </div>
                  ) : (
                    connections.map((conn) => {
                      const otherUser =
                        conn.userId === user?.id ? conn.connectedUser : conn.user

                      return (
                        <div
                          key={conn.id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar
                              profilePictureUrl={otherUser?.profilePictureUrl}
                              fullName={otherUser?.fullName || 'Unknown User'}
                              size="medium"
                            />
                            <div>
                              <Link
                                to={`/users/${otherUser?.id}`}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                {otherUser?.fullName || 'Unknown User'}
                              </Link>
                              <p className="text-sm text-gray-500">
                                {otherUser?.email} • Type: {conn.connectionType} • Connected{' '}
                                {new Date(conn.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(conn.id)}
                            disabled={actionLoading === conn.id}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            Unfriend
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
