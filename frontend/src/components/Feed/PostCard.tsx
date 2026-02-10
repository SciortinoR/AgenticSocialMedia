/**
 * PostCard component - displays a single post
 * File: frontend/src/components/Feed/PostCard.tsx
 */

import { useState, useEffect } from 'react'
import type { Post, Interaction } from '../../types/post'
import { postsService } from '../../services/posts'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Common/Avatar'

interface PostCardProps {
  post: Post
  onEdit?: (postId: number) => void
  onDelete?: (postId: number) => void
  onUpdate?: () => void
}

export default function PostCard({ post, onEdit, onDelete, onUpdate }: PostCardProps) {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Interaction[]>([])
  const [commentCount, setCommentCount] = useState(post.commentCount || 0)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [_isLoadingLikeStatus, setIsLoadingLikeStatus] = useState(true)
  const [commentLikeStates, setCommentLikeStates] = useState<Record<number, boolean>>({})
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostContent, setEditPostContent] = useState('')
  const [isSavingPost, setIsSavingPost] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date'

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString)
        return 'Invalid date'
      }

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Invalid date'
    }
  }

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postsService.unlikePost(post.id)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await postsService.likePost(post.id)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
      onUpdate?.()
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleCommentClick = async () => {
    if (!showCommentBox && comments.length === 0) {
      await loadComments()
    }
    setShowCommentBox(!showCommentBox)
  }

  const loadComments = async () => {
    try {
      const fetchedComments = await postsService.getComments(post.id)
      setComments(fetchedComments)

      // Load like status for each comment
      const likeStates: Record<number, boolean> = {}
      await Promise.all(
        fetchedComments.map(async (comment) => {
          try {
            const isLiked = await postsService.checkCommentLikeStatus(comment.id)
            likeStates[comment.id] = isLiked
          } catch (error) {
            console.error('Failed to load comment like status:', error)
            likeStates[comment.id] = false
          }
        })
      )
      setCommentLikeStates(likeStates)
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleCommentLike = async (commentId: number) => {
    try {
      const isLiked = commentLikeStates[commentId]
      if (isLiked) {
        await postsService.unlikeComment(commentId)
        setCommentLikeStates({ ...commentLikeStates, [commentId]: false })
      } else {
        await postsService.likeComment(commentId)
        setCommentLikeStates({ ...commentLikeStates, [commentId]: true })
      }

      // Refresh comments to get updated like counts
      await loadComments()
    } catch (error) {
      console.error('Failed to like/unlike comment:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmittingComment(true)
    try {
      await postsService.commentOnPost(post.id, { content: commentText })
      setCommentText('')
      setCommentCount((prev) => prev + 1)
      await loadComments()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await postsService.deleteComment(commentId)
      setCommentCount((prev) => Math.max(0, prev - 1))
      await loadComments()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleEditComment = (comment: Interaction) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.content || '')
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditCommentText('')
  }

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentText.trim()) return

    try {
      await postsService.updateComment(commentId, { content: editCommentText })
      setEditingCommentId(null)
      setEditCommentText('')
      await loadComments()
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  const handleEditPostClick = () => {
    if (onEdit) {
      // Use parent's edit handler if provided (for dashboard's special draft post editing)
      onEdit(post.id)
    } else {
      // Use inline editing
      setIsEditingPost(true)
      setEditPostContent(post.content)
      setShowMenu(false)
    }
  }

  const handleCancelPostEdit = () => {
    setIsEditingPost(false)
    setEditPostContent('')
  }

  const handleSavePostEdit = async () => {
    if (!editPostContent.trim()) return

    try {
      setIsSavingPost(true)
      await postsService.updatePost(post.id, { content: editPostContent })
      setIsEditingPost(false)
      setEditPostContent('')
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setIsSavingPost(false)
    }
  }

  const handleDeletePostClick = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    if (onDelete) {
      onDelete(post.id)
    } else {
      try {
        await postsService.deletePost(post.id)
        onUpdate?.()
      } catch (error) {
        console.error('Failed to delete post:', error)
        alert('Failed to delete post. Please try again.')
      }
    }
  }

  useEffect(() => {
    setLikeCount(post.likeCount || 0)
    setCommentCount(post.commentCount || 0)
  }, [post.likeCount, post.commentCount])

  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        setIsLoadingLikeStatus(true)
        const liked = await postsService.checkLikeStatus(post.id)
        setIsLiked(liked)
      } catch (error) {
        console.error('Failed to load like status:', error)
      } finally {
        setIsLoadingLikeStatus(false)
      }
    }

    loadLikeStatus()
  }, [post.id])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="mr-3">
            <Avatar
              profilePictureUrl={post.author?.profilePictureUrl}
              fullName={post.author?.fullName || 'User'}
              size="medium"
              isAgent={post.postType === 'agent'}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {post.postType === 'agent'
                  ? `${post.author?.fullName || 'User'}'s Agent`
                  : post.author?.fullName || 'User'}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  post.postType === 'agent'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {post.postType === 'agent' ? 'Agent' : 'Manual'}
              </span>
              {post.status === 'draft' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                  Draft
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(post.createdAt)}
              {post.isEdited && <span className="ml-2">(edited)</span>}
            </div>
          </div>
        </div>

        {post.userId === user?.id && !isEditingPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button
                  onClick={handleEditPostClick}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePostClick}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        {isEditingPost ? (
          <>
            <textarea
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              rows={4}
              disabled={isSavingPost}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePostEdit}
                disabled={!editPostContent.trim() || isSavingPost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSavingPost ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelPostEdit}
                disabled={isSavingPost}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition ${
            isLiked ? 'text-blue-600' : 'hover:text-blue-600'
          }`}
        >
          <span>{isLiked ? '👍' : '👍'}</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={handleCommentClick}
          className="flex items-center gap-1 hover:text-blue-600 transition"
        >
          <span>💬</span>
          <span>{commentCount}</span>
        </button>
      </div>

      {showCommentBox && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleSubmitComment} className="mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isSubmittingComment}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCommentBox(false)
                  setCommentText('')
                }}
                className="px-4 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmittingComment}
                className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-2">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Avatar
                      profilePictureUrl={comment.user?.profilePictureUrl}
                      fullName={comment.user?.fullName || 'User'}
                      size="small"
                      isAgent={comment.actorType === 'agent'}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {comment.actorType === 'agent'
                            ? `${comment.user?.fullName || 'User'}'s Agent`
                            : comment.user?.fullName || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={!editCommentText.trim()}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className={`flex items-center gap-1 text-xs transition ${
                                commentLikeStates[comment.id] ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                              }`}
                            >
                              <span>👍</span>
                              <span>{comment.likeCount || 0}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {comment.userId === user?.id && editingCommentId !== comment.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1"
                          title="Edit comment"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
