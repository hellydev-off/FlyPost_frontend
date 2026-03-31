import api from './index'
import { isMockMode, withDelay } from './mock'
import type { TelegramUser } from '@/utils/telegram'

export interface AuthResponse {
  token: string
  user: {
    id: string
    telegramId: string | null
    email: string | null
    username: string | null
    firstName: string
  }
}

export const authApi = {
  async register(email: string, password: string, firstName: string): Promise<AuthResponse> {
    if (isMockMode) {
      return withDelay<AuthResponse>({
        token: 'mock-jwt-token',
        user: { id: 'mock-1', telegramId: null, email, username: null, firstName },
      })
    }
    const { data } = await api.post<AuthResponse>('/api/auth/register', { email, password, firstName })
    return data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    if (isMockMode) {
      return withDelay<AuthResponse>({
        token: 'mock-jwt-token',
        user: { id: 'mock-1', telegramId: null, email, username: null, firstName: 'Mock' },
      })
    }
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password })
    return data
  },

  async telegram(initData: string): Promise<AuthResponse> {
    if (isMockMode) {
      return withDelay<AuthResponse>({
        token: 'mock-jwt-token',
        user: { id: 'mock-1', telegramId: '12345', email: null, username: 'mockuser', firstName: 'Mock User' },
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
