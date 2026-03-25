import type { Post } from './post.types'

export interface ChannelStats {
  total: number
  published: number
  scheduled: number
  drafts: number
  lastPosts: Post[]
}
