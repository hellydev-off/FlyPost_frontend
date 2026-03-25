import type { ChannelStats } from '@/types/analytics.types'
import { mockPosts } from './mockPosts'

export const mockAnalytics: ChannelStats = {
  total: 24,
  published: 18,
  scheduled: 3,
  drafts: 3,
  lastPosts: mockPosts.slice(0, 5),
}
