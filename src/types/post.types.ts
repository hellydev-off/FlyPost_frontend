export type PostStatus = 'draft' | 'published' | 'scheduled' | 'failed'

export interface Post {
  id: string
  channelId: string
  content: string
  status: PostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePostPayload {
  channelId: string
  content: string
}

export interface UpdatePostPayload {
  content: string
}

export interface PostFilters {
  channelId?: string
  status?: PostStatus
}
