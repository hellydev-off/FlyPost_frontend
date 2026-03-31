import { defineStore } from 'pinia'
import { ref } from 'vue'
import { achievementApi } from '@/api/achievement.api'
import type { Achievement } from '@/types/achievement.types'

export const useAchievementsStore = defineStore('achievements', () => {
  const achievements = ref<Achievement[]>([])
  const pendingToasts = ref<Achievement[]>([])

  async function fetchAll(): Promise<void> {
    try {
      achievements.value = await achievementApi.getAll()
    } catch {
      // fail silently
    }
  }

  async function check(): Promise<void> {
    try {
      const newOnes = await achievementApi.check()
      if (newOnes.length > 0) {
        achievements.value.push(...newOnes)
        pendingToasts.value.push(...newOnes)
      }
    } catch {
      // fail silently
    }
  }

  function dismissToast(): void {
    pendingToasts.value.shift()
  }

  function hasType(type: string): boolean {
    return achievements.value.some(a => a.type === type)
  }

  return { achievements, pendingToasts, fetchAll, check, dismissToast, hasType }
})
