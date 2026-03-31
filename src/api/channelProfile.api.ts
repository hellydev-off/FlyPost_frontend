import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockChannelProfiles } from './mock/mockChannelProfiles'
import type { ChannelProfile, UpdateChannelProfilePayload } from '@/types/channel.types'

const emptyProfile = (channelId: string): ChannelProfile => ({
  channelId,
  tone: null,
  audience: null,
  topics: [],
  forbiddenWords: [],
  examples: null,
})

export const channelProfileApi = {
  async get(channelId: string): Promise<ChannelProfile> {
    if (isMockMode) {
      return withDelay(mockChannelProfiles[channelId] ?? emptyProfile(channelId))
    }
    const { data } = await api.get<ChannelProfile>(`/api/channels/${channelId}/profile`)
    return data
  },

  async update(channelId: string, payload: UpdateChannelProfilePayload): Promise<ChannelProfile> {
    if (isMockMode) {
      const existing = mockChannelProfiles[channelId] ?? emptyProfile(channelId)
      const updated = { ...existing, ...payload }
      mockChannelProfiles[channelId] = updated
      return withDelay(updated)
    }
    const { data } = await api.put<ChannelProfile>(`/api/channels/${channelId}/profile`, payload)
    return data
  },
}
