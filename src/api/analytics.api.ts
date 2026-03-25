import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockAnalytics } from './mock/mockAnalytics'
import type { ChannelStats } from '@/types/analytics.types'

export const analyticsApi = {
  async getStats(channelId: string): Promise<ChannelStats> {
    if (isMockMode) return withDelay(mockAnalytics)
    const { data } = await api.get<ChannelStats>(`/api/analytics/${channelId}`)
    return data
  },
}
