import api from './index'
import { isMockMode, withDelay } from './mock'

export interface ProfileData {
  id: string
  email: string | null
  firstName: string
  username: string | null
  telegramId: string | null
  createdAt: string
  hasPassword: boolean
  hasPhoto: boolean
}

export interface ProfileStats {
  channels: number
  posts: number
  published: number
  scheduled: number
}

export const profileApi = {
  async get(): Promise<ProfileData> {
    if (isMockMode) {
      return withDelay({
        id: 'mock-1',
        email: 'dev@neopost.app',
        firstName: 'Dev User',
        username: 'devuser',
        telegramId: null,
        createdAt: '2026-01-15T10:00:00Z',
        hasPassword: true,
      })
    }
    const { data } = await api.get<ProfileData>('/api/profile')
    return data
  },

  async update(payload: { firstName?: string; username?: string }): Promise<ProfileData> {
    if (isMockMode) {
      return withDelay({
        id: 'mock-1',
        email: 'dev@neopost.app',
        firstName: payload.firstName ?? 'Dev User',
        username: payload.username ?? 'devuser',
        telegramId: null,
        createdAt: '2026-01-15T10:00:00Z',
        hasPassword: true,
      })
    }
    const { data } = await api.patch<ProfileData>('/api/profile', payload)
    return data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (isMockMode) {
      await withDelay(undefined)
      return
    }
    await api.post('/api/profile/change-password', { currentPassword, newPassword })
  },

  async getPhoto(): Promise<string | null> {
    if (isMockMode || window.location.hostname === 'localhost') return null
    try {
      const { data } = await api.get<Blob>('/api/profile/photo', { responseType: 'blob' })
      return URL.createObjectURL(data)
    } catch {
      return null
    }
  },

  async getStats(): Promise<ProfileStats> {
    if (isMockMode) {
      return withDelay({ channels: 3, posts: 24, published: 18, scheduled: 3 })
    }
    const { data } = await api.get<ProfileStats>('/api/profile/stats')
    return data
  },
}
