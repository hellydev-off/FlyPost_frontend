import type { Achievement } from '@/types/achievement.types'

export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    userId: 'mock-1',
    type: 'first_post',
    unlockedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'ach-2',
    userId: 'mock-1',
    type: 'first_scheduled',
    unlockedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
]
