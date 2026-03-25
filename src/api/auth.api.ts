import api from './index'
import { isMockMode, withDelay } from './mock'
import type { TelegramUser } from '@/utils/telegram'

export interface AuthResponse {
  token: string
  user: {
    id: string
    telegramId: string
    username: string | null
    firstName: string
  }
}

export const authApi = {
  async telegram(initData: string): Promise<AuthResponse> {
    if (isMockMode) {
      return withDelay<AuthResponse>({
        token: 'mock-jwt-token',
        user: { id: 'mock-1', telegramId: '12345', username: 'mockuser', firstName: 'Mock User' },
      })
    }
    const { data } = await api.post<AuthResponse>('/api/auth/telegram', { initData })
    return data
  },

  async devLogin(user: Pick<TelegramUser, 'id' | 'first_name' | 'username'>): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/dev-login', {
      telegramId: user.id,
      firstName: user.first_name,
      username: user.username,
    })
    return data
  },
}
