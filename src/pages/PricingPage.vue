<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlanStore } from '@/stores/usePlanStore'
import { subscriptionApi } from '@/api/subscription.api'
import { useToastStore } from '@/stores/useToastStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { isMockMode } from '@/api/mock'
import AppIcon from '@/components/common/AppIcon.vue'
import {
  PLAN_META, PLAN_LIMITS, PLAN_PRICES,
  type PlanKey, type PeriodMonths,
} from '@/types/plan.types'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()
const toast = useToastStore()
const { t } = useLocaleStore()

onMounted(async () => {
  if (route.query.payment === 'success') {
    try {
      const status = await subscriptionApi.getStatus()
      planStore.status = status
      toast.show(t('pricing.paymentPending'), 'success')
    } catch { /* ignore */ }
    router.replace({ name: 'pricing' })
  }
})

const selectedPeriod = ref<PeriodMonths>(1)
const loadingPlan = ref<PlanKey | null>(null)

const periods = computed((): Array<{ value: PeriodMonths; label: string }> => [
  { value: 1,  label: t('pricing.period1')  },
  { value: 3,  label: t('pricing.period3')  },
  { value: 6,  label: t('pricing.period6')  },
  { value: 12, label: t('pricing.period12') },
])

const paidPlans: Array<Exclude<PlanKey, 'free'>> = ['start', 'pro', 'max']

const planHighlights = computed((): Record<string, string[]> => ({
  start: [
    `${PLAN_LIMITS.start.channels} ${t('pricing.featChannels')}`,
    `${PLAN_LIMITS.start.scheduledPosts} ${t('pricing.featScheduled')}`,
    `${PLAN_LIMITS.start.aiGenerationsPerMonth} ${t('pricing.featAi')}`,
    `${PLAN_LIMITS.start.templates} ${t('pricing.featTemplates')}`,
  ],
  pro: [
    `∞ ${t('pricing.featChannels')}`,
    `∞ ${t('pricing.featScheduled')}`,
    `∞ ${t('pricing.featAi')}`,
    t('pricing.featAnalytics'),
    t('pricing.featWeeklyPlan'),
  ],
  max: [
    `∞ ${t('pricing.featChannels')}`,
    `∞ ${t('pricing.featAi')}`,
    t('pricing.featCompetitors'),
    t('pricing.featVoice'),
    t('pricing.featWeeklyPlan'),
  ],
}))

const currentPlan = computed(() => planStore.effectivePlan)
function isCurrentPlan(plan: PlanKey): boolean {
  return currentPlan.value === plan && !planStore.isTrial
}

function getSaving(plan: Exclude<PlanKey, 'free'>, period: PeriodMonths): number | undefined {
  if (period === 1) return undefined
  return PLAN_PRICES[plan][period].save
}

async function subscribe(plan: Exclude<PlanKey, 'free'>): Promise<void> {
  loadingPlan.value = plan
  try {
    if (isMockMode) {
      const status = await subscriptionApi.confirmPayment(plan, selectedPeriod.value)
      planStore.status = status
      toast.show(`${t('pricing.plan')} «${t(`planMeta.${plan}.name`)}» ${t('pricing.activatedSuccess')}`, 'success')
      router.back()
      return
    }
    const result = await subscriptionApi.initPayment(plan, selectedPeriod.value)
    window.location.href = result.paymentUrl
  } catch {
    toast.show(t('pricing.activateError'), 'error')
    loadingPlan.value = null
  }
}

const downgradingFree = ref(false)

async function downgradeFree(): Promise<void> {
  downgradingFree.value = true
  try {
    const status = await subscriptionApi.downgradeFree()
    planStore.status = status
    toast.show(t('pricing.downgradeSuccess'), 'success')
    router.back()
  } catch {
    toast.show(t('pricing.downgradeError'), 'error')
  } finally {
    downgradingFree.value = false
  }
}

const planColors: Record<string, string> = {
  start: '#3B82F6',
  pro:   '#8B5CF6',
  max:   '#F59E0B',
}

const isDev = import.meta.env.DEV
const allPlans: PlanKey[] = ['free', 'start', 'pro', 'max']
const devLoading = ref<PlanKey | null>(null)

async function devSwitchPlan(plan: PlanKey): Promise<void> {
  devLoading.value = plan
  try {
    await planStore.devSetPlan(plan)
    toast.show(`DEV: тариф «${plan}» активирован`, 'success')
  } catch {
    toast.show('DEV: ошибка переключения тарифа', 'error')
  } finally {
    devLoading.value = null
  }
}
</script>

<template>
  <div class="pricing">

    <!-- Header -->
    <div class="pricing__header">
      <button class="pricing__back" @click="router.back()">
        <AppIcon name="chevron-left" :size="20" />
      </button>
      <div>
        <h1 class="pricing__title">{{ t('pricing.title') }}</h1>
        <p v-if="planStore.isTrial" class="pricing__trial-note">
          {{ t('pricing.trialNote', { days: planStore.trialDaysLeft ?? 0 }) }}
        </p>
      </div>
    </div>

    <!-- Test mode banner -->
    <div v-if="isMockMode" class="pricing__test-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 3H15M10 3V9L7.5 14M14 9V3M14 9L16.5 14M7.5 14H16.5M7.5 14L6 18H18L16.5 14"/>
      </svg>
      {{ t('pricing.testBanner') }}
    </div>

    <!-- Dev plan switcher -->
    <div v-if="isDev" class="pricing__dev-panel">
      <span class="pricing__dev-label">⚙ DEV: тариф</span>
      <div class="pricing__dev-plans">
        <button
          v-for="plan in allPlans"
          :key="plan"
          class="pricing__dev-btn"
          :class="{ 'pricing__dev-btn--active': planStore.effectivePlan === plan && !planStore.isTrial }"
          :disabled="devLoading !== null"
          @click="devSwitchPlan(plan)"
        >
          <span v-if="devLoading === plan" class="pricing__spinner pricing__spinner--dark" />
          <template v-else>{{ plan }}</template>
        </button>
      </div>
    </div>

    <!-- Period toggle -->
    <div class="pricing__periods">
      <button
        v-for="p in periods"
        :key="p.value"
        class="pricing__period"
        :class="{ 'pricing__period--active': selectedPeriod === p.value }"
        @click="selectedPeriod = p.value"
      >
        {{ p.label }}
        <span v-if="p.value > 1" class="pricing__period-save">−{{ PLAN_PRICES.max[p.value].save }}%</span>
      </button>
    </div>

    <!-- Plan cards -->
    <div class="pricing__cards">
      <div
        v-for="plan in paidPlans"
        :key="plan"
        class="pricing__card"
        :class="{ 'pricing__card--active': isCurrentPlan(plan) }"
        :style="isCurrentPlan(plan) ? { '--plan-color': planColors[plan] } : { '--plan-color': planColors[plan] }"
      >
        <!-- Top row: name + price -->
        <div class="pricing__card-head">
          <div class="pricing__card-name-row">
            <span class="pricing__card-dot" :style="{ background: planColors[plan] }" />
            <span class="pricing__card-name">{{ t(`planMeta.${plan}.name`) }}</span>
            <span v-if="isCurrentPlan(plan)" class="pricing__current-chip">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ t('pricing.currentBadge') }}
            </span>
            <span v-else-if="plan === 'pro'" class="pricing__popular-chip">{{ t('pricing.popular') }}</span>
          </div>

          <div class="pricing__price-row">
            <span class="pricing__amount">{{ PLAN_PRICES[plan][selectedPeriod].perMonth.toLocaleString('ru') }}</span>
            <span class="pricing__unit">₽ / {{ t('pricing.perMonth') }}</span>
            <span v-if="getSaving(plan, selectedPeriod)" class="pricing__save-chip">
              −{{ getSaving(plan, selectedPeriod) }}%
            </span>
          </div>

          <p v-if="selectedPeriod > 1" class="pricing__billing">
            {{ PLAN_PRICES[plan][selectedPeriod].total.toLocaleString() }} ₽ за {{ selectedPeriod }} {{ t('pricing.billingMonths') }}
          </p>
        </div>

        <!-- Highlights -->
        <ul class="pricing__highlights">
          <li v-for="(item, i) in planHighlights[plan]" :key="i" class="pricing__highlight">
            <span class="pricing__highlight-dot" :style="{ background: planColors[plan] }" />
            {{ item }}
          </li>
        </ul>

        <!-- CTA -->
        <button
          class="pricing__cta"
          :style="{ '--plan-color': planColors[plan] }"
          :disabled="isCurrentPlan(plan) || loadingPlan !== null"
          @click="subscribe(plan)"
        >
          <span v-if="loadingPlan === plan" class="pricing__spinner" />
          <template v-else-if="isCurrentPlan(plan)">{{ t('pricing.currentPlan') }}</template>
          <template v-else>{{ t('pricing.selectPlan') }}</template>
        </button>
      </div>
    </div>

    <!-- Free plan -->
    <div class="pricing__free" :class="{ 'pricing__free--current': isCurrentPlan('free') }">
      <div class="pricing__free-info">
        <span class="pricing__card-dot" style="background: var(--fp-text-tertiary)" />
        <span class="pricing__free-name">Free</span>
        <span v-if="isCurrentPlan('free')" class="pricing__current-chip pricing__current-chip--gray">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('pricing.currentBadge') }}
        </span>
        <span class="pricing__free-price">0 ₽</span>
      </div>

      <p class="pricing__free-desc">{{ t('pricing.freeForever') }}</p>

      <button
        v-if="!isCurrentPlan('free')"
        class="pricing__free-btn"
        :disabled="downgradingFree"
        @click="downgradeFree"
      >
        <span v-if="downgradingFree" class="pricing__spinner pricing__spinner--dark" />
        <template v-else>{{ t('pricing.downgradeFree') }}</template>
      </button>
    </div>

  </div>
</template>

<style scoped>
.pricing {
  padding-bottom: 48px;
}

/* Header */
.pricing__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.pricing__back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text);
  flex-shrink: 0;
  transition: all var(--fp-transition);
}
.pricing__back:active { transform: scale(0.9); }

.pricing__title {
  font-size: 24px;
  font-weight: 800;
  color: var(--fp-text);
  line-height: 1;
}

.pricing__trial-note {
  font-size: 12px;
  color: var(--fp-success);
  font-weight: 600;
  margin-top: 4px;
}

/* Dev panel */
.pricing__dev-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--fp-radius-sm);
  margin-bottom: 16px;
}

.pricing__dev-label {
  font-size: 11px;
  font-weight: 700;
  color: #10B981;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pricing__dev-plans {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pricing__dev-btn {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
  border: 1px solid var(--fp-border);
  transition: all var(--fp-transition);
  min-width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pricing__dev-btn:not(:disabled):hover {
  border-color: #10B981;
  color: #10B981;
}
.pricing__dev-btn--active {
  background: rgba(16, 185, 129, 0.12);
  border-color: #10B981;
  color: #10B981;
}
.pricing__dev-btn:disabled { opacity: 0.5; }

/* Test banner */
.pricing__test-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: var(--fp-radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: #D97706;
  margin-bottom: 16px;
}

/* Periods */
.pricing__periods {
  display: flex;
  gap: 4px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  padding: 3px;
  margin-bottom: 20px;
}

.pricing__period {
  flex: 1;
  padding: 8px 2px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all var(--fp-transition);
}

.pricing__period--active {
  background: var(--fp-bg);
  color: var(--fp-text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.pricing__period-save {
  font-size: 10px;
  color: var(--fp-success);
  font-weight: 700;
}

/* Cards */
.pricing__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.pricing__card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
  border: 1.5px solid transparent;
  transition: border-color var(--fp-transition);
}

.pricing__card--active {
  border-color: var(--plan-color);
  background: var(--fp-bg);
}

/* Card head */
.pricing__card-head {
  margin-bottom: 14px;
}

.pricing__card-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pricing__card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pricing__card-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
  flex: 1;
}

.pricing__current-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-primary);
  background: var(--fp-primary-bg);
  padding: 3px 9px;
  border-radius: 20px;
}

.pricing__current-chip--gray {
  color: var(--fp-text-secondary);
  background: var(--fp-bg-secondary);
}

.pricing__popular-chip {
  font-size: 11px;
  font-weight: 700;
  color: #8B5CF6;
  background: rgba(139, 92, 246, 0.1);
  padding: 3px 9px;
  border-radius: 20px;
}

.pricing__price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.pricing__amount {
  font-size: 32px;
  font-weight: 900;
  color: var(--fp-text);
  letter-spacing: -1px;
  line-height: 1;
}

.pricing__unit {
  font-size: 13px;
  color: var(--fp-text-secondary);
  flex: 1;
}

.pricing__save-chip {
  font-size: 12px;
  font-weight: 700;
  color: var(--fp-success);
  background: rgba(34, 197, 94, 0.1);
  padding: 3px 9px;
  border-radius: 20px;
}

.pricing__billing {
  font-size: 12px;
  color: var(--fp-text-tertiary);
  margin-top: 4px;
}

/* Highlights */
.pricing__highlights {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 16px;
}

.pricing__highlight {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--fp-text-secondary);
}

.pricing__highlight-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* CTA */
.pricing__cta {
  width: 100%;
  padding: 13px;
  border-radius: var(--fp-radius-sm);
  font-size: 15px;
  font-weight: 700;
  color: var(--plan-color);
  background: color-mix(in srgb, var(--plan-color) 10%, transparent);
  text-align: center;
  transition: all var(--fp-transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pricing__cta:active:not(:disabled) {
  opacity: 0.8;
  transform: scale(0.98);
}

.pricing__cta:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Spinner */
.pricing__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.pricing__spinner--dark {
  border-color: rgba(0,0,0,0.1);
  border-top-color: var(--fp-text-secondary);
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Free plan */
.pricing__free {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
  border: 1.5px solid transparent;
}

.pricing__free--current {
  border-color: var(--fp-border);
}

.pricing__free-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pricing__free-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
  flex: 1;
}

.pricing__free-price {
  font-size: 20px;
  font-weight: 900;
  color: var(--fp-text);
}

.pricing__free-desc {
  font-size: 12px;
  color: var(--fp-text-tertiary);
  margin-bottom: 12px;
}

.pricing__free-btn {
  width: 100%;
  padding: 12px;
  border-radius: var(--fp-radius-sm);
  background: var(--fp-bg);
  border: 1.5px solid var(--fp-border);
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  text-align: center;
  transition: all var(--fp-transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pricing__free-btn:active:not(:disabled) { opacity: 0.7; }
.pricing__free-btn:disabled { opacity: 0.4; cursor: default; }
</style>
