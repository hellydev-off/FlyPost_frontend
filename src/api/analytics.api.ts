import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockAnalytics } from './mock/mockAnalytics'
import type {
  ChannelStats,
  SubscriberHistory,
  BestTimeData,
  HealthScoreData,
  StreakData,
} from '@/types/analytics.types'

const mockSubscriberHistory: SubscriberHistory = {
  history: Array.from({ length: 14 }, (_, i) => ({
    count: 1000 + i * 12 + Math.floor(Math.random() * 5),
    recordedAt: new Date(Date.now() - (13 - i) * 24 * 3600 * 1000).toISOString(),
  })),
  current: 1156,
  growth7d: 84,
  growth30d: 156,
}

export const analyticsApi = {
  async getStats(channelId: string): Promise<ChannelStats> {
    if (isMockMode) return withDelay(mockAnalytics)
    const { data } = await api.get<ChannelStats>(`/api/analytics/${channelId}`)
    return data
  },

  async getSubscriberHistory(channelId: string): Promise<SubscriberHistory> {
    if (isMockMode) return withDelay(mockSubscriberHistory)
    const { data } = await api.get<SubscriberHistory>(`/api/analytics/${channelId}/subscribers`)
    return data
  },

  async getBestTime(channelId: string): Promise<BestTimeData> {
    if (isMockMode) {
      return withDelay<BestTimeData>({
        hasEnoughData: true,
        slots: [
          { hour: 19, postsCount: 8, avgGrowth: 14 },
          { hour: 12, postsCount: 5, avgGrowth: 7 },
          { hour: 9, postsCount: 4, avgGrowth: null },
        ],
      })
    }
    const { data } = await api.get<BestTimeData>(`/api/analytics/${channelId}/best-time`)
    return data
  },

  async getHealthScore(channelId: string): Promise<HealthScoreData> {
    if (isMockMode) {
      return withDelay<HealthScoreData>({
        score: 74,
        factors: { regularity: 71, growth: 80, activity: 60 },
      })
    }
    const { data } = await api.get<HealthScoreData>(`/api/analytics/${channelId}/health-score`)
    return data
  },

  async getStreak(channelId: string): Promise<StreakData> {
    if (isMockMode) {
      return withDelay<StreakData>({ streak: 7, lastPostDate: new Date().toISOString() })
    }
    const { data } = await api.get<StreakData>(`/api/analytics/${channelId}/streak`)
    return data
  },
}
