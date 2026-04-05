import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockPosts } from './mock/mockPosts'
import type { Post, CreatePostPayload, UpdatePostPayload, PostFilters } from '@/types/post.types'

export const postsApi = {
  async getAll(filters?: PostFilters): Promise<Post[]> {
    if (isMockMode) {
      let posts = mockPosts
      if (filters?.channelId) {
        posts = posts.filter(p => p.channelId === filters.channelId)
      }
      if (filters?.status) {
        posts = posts.filter(p => p.status === filters.status)
      }
      return withDelay(posts)
    }
    const { data } = await api.get<Post[]>('/api/posts', { params: filters })
    return data
  },

  async getOne(id: string): Promise<Post> {
    if (isMockMode) {
      const post = mockPosts.find(p => p.id === id)
      if (!post) throw new Error('Post not found')
      return withDelay(post)
    }
    const { data } = await api.get<Post>(`/api/posts/${id}`)
    return data
  },

  async create(payload: CreatePostPayload): Promise<Post> {
    if (isMockMode) {
      const newPost: Post = {
        id: String(Date.now()),
        channelId: payload.channelId,
        content: payload.content,
        status: 'draft',
        publishedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return withDelay(newPost)
    }
    const { data } = await api.post<Post>('/api/posts', payload)
    return data
  },

  async update(id: string, payload: UpdatePostPayload): Promise<Post> {
    if (isMockMode) {
      const post = mockPosts.find(p => p.id === id)
      if (!post) throw new Error('Post not found')
      return withDelay({ ...post, ...payload, updatedAt: new Date().toISOString() })
    }
    const { data } = await api.put<Post>(`/api/posts/${id}`, payload)
    return data
  },

  async publish(id: string): Promise<Post> {
    if (isMockMode) {
      const post = mockPosts.find(p => p.id === id)
      if (!post) throw new Error('Post not found')
      return withDelay({ ...post, status: 'published' as const, publishedAt: new Date().toISOString() })
    }
    const { data } = await api.post<Post>(`/api/posts/${id}/publish`)
    return data
  },

  async delete(id: string): Promise<void> {
    if (isMockMode) return withDelay(undefined)
    await api.delete(`/api/posts/${id}`)
  },

  async uploadMedia(id: string, files: File[]): Promise<Post> {
    const form = new FormData()
    files.forEach(f => form.append('files', f))
    const { data } = await api.post<Post>(`/api/posts/${id}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async crossPost(id: string, channelIds: string[]): Promise<Post[]> {
    const { data } = await api.post<Post[]>(`/api/posts/${id}/crosspost`, { channelIds })
    return data
  },

}
