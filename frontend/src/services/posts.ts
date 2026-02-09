/**
 * Posts API service
 * File: frontend/src/services/posts.ts
 */

import apiClient from './api'
import type { Post, CreatePostData, UpdatePostData, Interaction, CreateCommentData } from '../types/post'

export const postsService = {
  /**
   * Get all posts for current user
   */
  async getPosts(skip: number = 0, limit: number = 20): Promise<Post[]> {
    const response = await apiClient.get('/api/posts/', { params: { skip, limit } })
    return response.data
  },

  /**
   * Create a new post
   */
  async createPost(data: CreatePostData): Promise<Post> {
    const response = await apiClient.post('/api/posts/', data)
    return response.data
  },

  /**
   * Get a specific post
   */
  async getPost(postId: number): Promise<Post> {
    const response = await apiClient.get(`/api/posts/${postId}`)
    return response.data
  },

  /**
   * Update a post
   */
  async updatePost(postId: number, data: UpdatePostData): Promise<Post> {
    const response = await apiClient.put(`/api/posts/${postId}`, data)
    return response.data
  },

  /**
   * Delete a post
   */
  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(`/api/posts/${postId}`)
  },

  /**
   * Check if current user has liked a post
   */
  async checkLikeStatus(postId: number): Promise<boolean> {
    const response = await apiClient.get(`/api/posts/${postId}/like/status`)
    return response.data.isLiked
  },

  /**
   * Like a post
   */
  async likePost(postId: number): Promise<Interaction> {
    const response = await apiClient.post(`/api/posts/${postId}/like`)
    return response.data
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: number): Promise<void> {
    await apiClient.delete(`/api/posts/${postId}/like`)
  },

  /**
   * Comment on a post
   */
  async commentOnPost(postId: number, data: CreateCommentData): Promise<Interaction> {
    const response = await apiClient.post(`/api/posts/${postId}/comments`, data)
    return response.data
  },

  /**
   * Get comments for a post
   */
  async getComments(postId: number): Promise<Interaction[]> {
    const response = await apiClient.get(`/api/posts/${postId}/comments`)
    return response.data
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: number, data: CreateCommentData): Promise<Interaction> {
    const response = await apiClient.put(`/api/comments/${commentId}`, data)
    return response.data
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/api/comments/${commentId}`)
  },

  /**
   * Check if current user has liked a comment
   */
  async checkCommentLikeStatus(commentId: number): Promise<boolean> {
    const response = await apiClient.get(`/api/comments/${commentId}/like/status`)
    return response.data.isLiked
  },

  /**
   * Like a comment
   */
  async likeComment(commentId: number): Promise<Interaction> {
    const response = await apiClient.post(`/api/comments/${commentId}/like`)
    return response.data
  },

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: number): Promise<void> {
    await apiClient.delete(`/api/comments/${commentId}/like`)
  },

  /**
   * Get posts for a specific user
   */
  async getUserPosts(userId: number, skip: number = 0, limit: number = 20): Promise<Post[]> {
    const response = await apiClient.get(`/api/posts/user/${userId}`, { params: { skip, limit } })
    return response.data
  },

  /**
   * Get personalized feed (own posts + connections' posts)
   */
  async getFeed(skip: number = 0, limit: number = 20): Promise<Post[]> {
    const response = await apiClient.get('/api/feed/', { params: { skip, limit } })
    return response.data
  },

  /**
   * Get global feed (all published posts)
   */
  async getGlobalFeed(skip: number = 0, limit: number = 20): Promise<Post[]> {
    const response = await apiClient.get('/api/feed/all', { params: { skip, limit } })
    return response.data
  },
}
