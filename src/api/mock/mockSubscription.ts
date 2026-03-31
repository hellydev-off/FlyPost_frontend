import type { SubscriptionStatus } from '@/types/plan.types'
import { PLAN_LIMITS } from '@/types/plan.types'

const trialEndsAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()

export const mockSubscription: SubscriptionStatus = {
  plan: 'free',
  effectivePlan: 'max',
  isTrial: true,
  trialDaysLeft: 12,
  trialEndsAt,
  subscriptionEndsAt: null,
  usage: {
    aiGenerations: 3,
    scheduledPosts: 2,
    channels: 1,
    templates: 2,
  },
  limits: PLAN_LIMITS.max,
}
