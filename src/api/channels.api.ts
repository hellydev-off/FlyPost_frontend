import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockChannels } from './mock/mockChannels'
import type { Channel, CreateChannelPayload } from '@/types/channel.types'

export const channelsApi = {
  async getAll(): Promise<Channel[]> {
    if (isMockMode) return withDelay(mockChannels)
    const { data } = await api.get<Channel[]>('/api/channels')
    return data
  },

  async addChannel(payload: CreateChannelPayload): Promise<Channel> {
    if (isMockMode) {
      const newChannel: Channel = {
        id: String(Date.now()),
        telegramChannelId: payload.telegramChannelId,
        title: payload.title,
        username: null,
        botIsAdmin: false,
        createdAt: new Date().toISOString(),
      }
      return withDelay(newChannel)
    }
    const { data } = await api.post<Channel>('/api/channels', payload)
    return data
  },

  async deleteChannel(id: string): Promise<void> {
    if (isMockMode) return withDelay(undefined)
    await api.delete(`/api/channels/${id}`)
  },
}
