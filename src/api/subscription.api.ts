import api from './index'
import { isMockMode, withDelay } from './mock'
import type { SubscriptionStatus, PlanKey, PeriodMonths } from '@/types/plan.types'
import { PLAN_LIMITS } from '@/types/plan.types'
import { mockSubscription } from './mock/mockSubscription'

export const subscriptionApi = {
  async getStatus(): Promise<SubscriptionStatus> {
    if (isMockMode) return withDelay({ ...mockSubscription }, 300)
    const { data } = await api.get<SubscriptionStatus>('/api/subscription/status')
    return data
  },

  async initPayment(plan: Exclude<PlanKey, 'free'>, months: PeriodMonths) {
    if (isMockMode) {
      return withDelay({ orderId: 'mock_order_123', paymentUrl: '#', plan, months }, 500)
    }
    const { data } = await api.post('/api/subscription/payment/init', { plan, months })
    return data
  },

  /** Dev/stub: manually confirm payment without real payment flow */
  async confirmPayment(plan: Exclude<PlanKey, 'free'>, months: PeriodMonths): Promise<SubscriptionStatus> {
    if (isMockMode) {
      return withDelay({ ...mockSubscription, plan, effectivePlan: plan, isTrial: false, limits: PLAN_LIMITS[plan] }, 600)
    }
    const { data } = await api.post<SubscriptionStatus>('/api/subscription/payment/confirm', { plan, months })
    return data
  },

  /** Downgrade to free (cancels paid subscription) */
  async downgradeFree(): Promise<SubscriptionStatus> {
    if (isMockMode) {
      return withDelay({ ...mockSubscription, plan: 'free' as PlanKey, effectivePlan: 'free' as PlanKey, isTrial: false, trialEndsAt: null, subscriptionEndsAt: null, trialDaysLeft: null, limits: PLAN_LIMITS.free }, 400)
    }
    const { data } = await api.post<SubscriptionStatus>('/api/subscription/downgrade-free')
    return data
  },

  /** DEV ONLY: switch plan instantly without payment */
  async devSetPlan(plan: PlanKey): Promise<SubscriptionStatus> {
    const { data } = await api.post<SubscriptionStatus>('/api/subscription/dev-set-plan', { plan })
    return data
  },
}
