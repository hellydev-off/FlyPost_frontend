import { defineStore } from 'pinia'
import { ref } from 'vue'
import { referralApi } from '@/api/referral.api'
import type { ReferralStats } from '@/types/referral.types'

export const useReferralStore = defineStore('referral', () => {
  const stats = ref<ReferralStats | null>(null)
  const loading = ref(false)

  async function fetchStats(): Promise<void> {
    if (loading.value) return
    loading.value = true
    try {
      stats.value = await referralApi.getStats()
    } catch {
      // fail silently
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
})
