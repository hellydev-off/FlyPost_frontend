import type { Post } from './post.types'

export interface ChannelStats {
  total: number
  published: number
  scheduled: number
  drafts: number
  lastPosts: Post[]
}

export interface SubscriberPoint {
  count: number
  recordedAt: string
}

export interface SubscriberHistory {
  history: SubscriberPoint[]
  current: number | null
  growth7d: number | null
  growth30d: number | null
}

export interface BestTimeSlot {
  hour: number
  postsCount: number
  avgGrowth: number | null
}

export interface BestTimeData {
  hasEnoughData: boolean
  slots: BestTimeSlot[]
}

export interface HealthScoreFactors {
  regularity: number
  growth: number
  activity: number
}

export interface HealthScoreData {
  score: number
  factors: HealthScoreFactors
}

export interface StreakData {
  streak: number
  lastPostDate: string | null
}
