export type PostStatus = 'draft' | 'published' | 'scheduled' | 'failed'

export interface PostButton {
  id: string
  text: string
  type: 'url' | 'vote'
  url?: string
  clickCount: number
}

export interface PostPoll {
  question: string
  options: string[]
  isAnonymous: boolean
  allowsMultipleAnswers: boolean
}

export interface Post {
  id: string
  channelId: string
  channel?: { id: string; title: string }
  content: string
  status: PostStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  buttons?: PostButton[] | null
  poll?: PostPoll | null
  protectContent?: boolean
  pinAfterPublish?: boolean
  disableWebPreview?: boolean
}

export interface CreatePostPayload {
  channelId: string
  content: string
  buttons?: PostButton[]
  poll?: PostPoll | null
  protectContent?: boolean
  pinAfterPublish?: boolean
  disableWebPreview?: boolean
}

export interface UpdatePostPayload {
  content: string
  buttons?: PostButton[] | null
  poll?: PostPoll | null
  protectContent?: boolean
  pinAfterPublish?: boolean
  disableWebPreview?: boolean
}

export interface PostFilters {
  channelId?: string
  status?: PostStatus
}
