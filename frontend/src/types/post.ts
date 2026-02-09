/**
 * Post type definitions
 * File: frontend/src/types/post.ts
 */

export type PostType = 'agent' | 'human'
export type PostStatus = 'draft' | 'published' | 'scheduled'

export interface Post {
  id: number
  userId: number
  agentId: number | null
  content: string
  postType: PostType
  status: PostStatus
  isEdited: boolean
  editedByUser: boolean
  isDeleted: boolean
  likeCount: number
  commentCount: number
  createdAt: string
  updatedAt: string
  author?: {
    id: number
    fullName: string
    profilePictureUrl?: string
  }
}

export interface CreatePostData {
  content: string
}

export interface UpdatePostData {
  content?: string
  status?: PostStatus
}

export type InteractionType = 'like' | 'comment' | 'reaction'
export type ActorType = 'agent' | 'human'

export interface Interaction {
  id: number
  userId: number
  postId: number | null
  parentInteractionId: number | null
  interactionType: InteractionType
  actorType: ActorType
  content: string | null
  likeCount: number
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    fullName: string
    email: string
    profilePictureUrl?: string
  }
}

export interface CreateCommentData {
  content: string
}
