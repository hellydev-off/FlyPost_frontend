import api from './index'
import { isMockMode, withDelay } from './mock'

export interface AuthResponse {
  token: string
  user: {
    id: string
    telegramId: string | null
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

  async devLogin(username: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/dev-login', { username })
    return data
  },
}
