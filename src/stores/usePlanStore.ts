import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionApi } from '@/api/subscription.api'
import type { SubscriptionStatus, PlanKey } from '@/types/plan.types'
import { PLAN_LIMITS } from '@/types/plan.types'
import { useAuthStore } from './useAuthStore'

export const usePlanStore = defineStore('plan', () => {
  const status = ref<SubscriptionStatus | null>(null)

  // Paywall state: set when backend returns 402
  const paywallLimitCode = ref<string | null>(null)

  const effectivePlan = computed<PlanKey>(() => status.value?.effectivePlan ?? 'free')
  const isTrial = computed(() => status.value?.isTrial ?? false)
  const trialDaysLeft = computed(() => status.value?.trialDaysLeft ?? null)
  const limits = computed(() => status.value?.limits ?? PLAN_LIMITS.free)
  const usage = computed(() => status.value?.usage ?? { aiGenerations: 0, scheduledPosts: 0, channels: 0, templates: 0 })

  async function fetchStatus(): Promise<void> {
    try {
      status.value = await subscriptionApi.getStatus()
    } catch {
      // fail silently
    }
  }

  function showPaywall(limitCode: string): void {
    paywallLimitCode.value = limitCode
  }

  function hidePaywall(): void {
    paywallLimitCode.value = null
  }

  /** Check if a numeric limit is not yet reached. -1 means unlimited. */
  function withinLimit(used: number, limit: number): boolean {
    if (limit === -1) return true
    return used < limit
  }

  function canAddChannel(): boolean {
    return withinLimit(usage.value.channels, limits.value.channels)
  }

  function canSchedulePost(): boolean {
    return withinLimit(usage.value.scheduledPosts, limits.value.scheduledPosts)
  }

  function canUseAi(): boolean {
    return withinLimit(usage.value.aiGenerations, limits.value.aiGenerationsPerMonth)
  }

  function canAddTemplate(): boolean {
    return withinLimit(usage.value.templates, limits.value.templates)
  }

  function hasFeature(feature: 'fullAnalytics' | 'competitors' | 'weeklyPlan' | 'voiceProfile'): boolean {
    return limits.value[feature]
  }

  return {
    status,
    paywallLimitCode,
    effectivePlan,
    isTrial,
    trialDaysLeft,
    limits,
    usage,
    fetchStatus,
    showPaywall,
    hidePaywall,
    canAddChannel,
    canSchedulePost,
    canUseAi,
    canAddTemplate,
    hasFeature,
  }
})
