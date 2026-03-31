import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockAchievements } from './mock/mockAchievements'
import type { Achievement } from '@/types/achievement.types'

let mockData = [...mockAchievements]

export const achievementApi = {
  async getAll(): Promise<Achievement[]> {
    if (isMockMode) return withDelay([...mockData])
    const { data } = await api.get<Achievement[]>('/api/achievements')
    return data
  },

  async check(): Promise<Achievement[]> {
    if (isMockMode) return withDelay([])
    const { data } = await api.post<Achievement[]>('/api/achievements/check')
    return data
  },
}
