<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/usePlanStore'
import { subscriptionApi } from '@/api/subscription.api'
import { useToastStore } from '@/stores/useToastStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import {
  PLAN_META, PLAN_LIMITS, PLAN_PRICES,
  type PlanKey, type PeriodMonths,
} from '@/types/plan.types'

const router = useRouter()
const planStore = usePlanStore()
const toast = useToastStore()
const { t } = useLocaleStore()

const selectedPeriod = ref<PeriodMonths>(1)
const loadingPlan = ref<PlanKey | null>(null)

const periods = computed((): Array<{ value: PeriodMonths; label: string }> => [
  { value: 1,  label: t('pricing.period1')  },
  { value: 3,  label: t('pricing.period3')  },
  { value: 6,  label: t('pricing.period6')  },
  { value: 12, label: t('pricing.period12') },
])

const paidPlans: Array<Exclude<PlanKey, 'free'>> = ['start', 'pro', 'max']

const featuresTable = computed(() => [
  { key: 'channels',    label: t('pricing.featChannels'),    svg: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.64 3.38 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.08 6.08l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },
  { key: 'scheduled',   label: t('pricing.featScheduled'),   svg: `<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>` },
  { key: 'ai',          label: t('pricing.featAi'),          svg: `<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  { key: 'templates',   label: t('pricing.featTemplates'),   svg: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>` },
  { key: 'analytics',   label: t('pricing.featAnalytics'),   svg: `<path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>` },
  { key: 'competitors', label: t('pricing.featCompetitors'), svg: `<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>` },
  { key: 'weeklyPlan',  label: t('pricing.featWeeklyPlan'),  svg: `<path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  { key: 'voice',       label: t('pricing.featVoice'),       svg: `<path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>` },
])

const freeLimits = PLAN_LIMITS.free

function getFeatureValue(plan: Exclude<PlanKey, 'free'>, key: string): string | boolean {
  const l = PLAN_LIMITS[plan]
  switch (key) {
    case 'channels':    return l.channels === -1 ? '∞' : String(l.channels)
    case 'scheduled':   return l.scheduledPosts === -1 ? '∞' : String(l.scheduledPosts)
    case 'ai':          return l.aiGenerationsPerMonth === -1 ? '∞' : String(l.aiGenerationsPerMonth)
    case 'templates':   return l.templates === -1 ? '∞' : String(l.templates)
    case 'analytics':   return l.fullAnalytics
    case 'competitors': return l.competitors
    case 'weeklyPlan':  return l.weeklyPlan
    case 'voice':       return l.voiceProfile
    default: return false
  }
}

function getFreeValue(key: string): string | boolean {
  switch (key) {
    case 'channels':    return String(freeLimits.channels)
    case 'scheduled':   return String(freeLimits.scheduledPosts)
    case 'ai':          return false
    case 'templates':   return false
    case 'analytics':   return false
    case 'competitors': return false
    case 'weeklyPlan':  return false
    case 'voice':       return false
    default: return false
  }
}

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
    const status = await subscriptionApi.confirmPayment(plan, selectedPeriod.value)
    planStore.status = status
    toast.show(`${t('pricing.plan')} «${t(`planMeta.${plan}.name`)}» ${t('pricing.activatedSuccess')}`, 'success')
    router.back()
  } catch {
    toast.show(t('pricing.activateError'), 'error')
  } finally {
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
</script>

<template>
  <div class="pricing">

    <!-- Header -->
    <div class="pricing__header">
      <button class="pricing__back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div>
        <h1 class="pricing__title">{{ t('pricing.title') }}</h1>
        <p v-if="planStore.isTrial" class="pricing__trial-note">
          {{ t('pricing.trialNote', { days: planStore.trialDaysLeft ?? 0 }) }}
        </p>
      </div>
    </div>

    <!-- Test mode banner -->
    <div class="pricing__test-banner">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 3H15M10 3V9L7.5 14M14 9V3M14 9L16.5 14M7.5 14H16.5M7.5 14L6 18H18L16.5 14"/>
      </svg>
      {{ t('pricing.testBanner') }}
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
        <span v-if="p.value > 1" class="pricing__period-save">
          −{{ PLAN_PRICES.max[p.value].save }}%
        </span>
      </button>
    </div>

    <!-- Paid plan cards -->
    <div class="pricing__cards">
      <div
        v-for="plan in paidPlans"
        :key="plan"
        class="pricing__card"
        :class="{ 'pricing__card--popular': plan === 'pro', 'pricing__card--active': isCurrentPlan(plan) }"
      >
        <!-- Badge -->
        <div v-if="isCurrentPlan(plan)" class="pricing__badge pricing__badge--current">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ t('pricing.currentBadge') }}
        </div>
        <div v-else-if="plan === 'pro'" class="pricing__badge pricing__badge--popular">
          {{ t('pricing.popular') }}
        </div>

        <!-- Coloured top -->
        <div class="pricing__card-top" :class="`pricing__card-top--${plan}`">
          <div class="pricing__card-icon">
            <svg
              v-if="PLAN_META[plan].icon"
              :viewBox="PLAN_META[plan].icon!.viewBox"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path :d="PLAN_META[plan].icon!.path" fill="white"/>
            </svg>
          </div>

          <div class="pricing__card-label">
            <h3 class="pricing__card-name">{{ t(`planMeta.${plan}.name`) }}</h3>
            <p class="pricing__card-desc">{{ t(`planMeta.${plan}.description`) }}</p>
          </div>

          <div v-if="getSaving(plan, selectedPeriod)" class="pricing__save-chip">
            −{{ getSaving(plan, selectedPeriod) }}%
          </div>
        </div>

        <!-- Price -->
        <div class="pricing__price-block">
          <div class="pricing__price">
            <span class="pricing__amount">{{ PLAN_PRICES[plan][selectedPeriod].perMonth.toLocaleString('ru') }}</span>
            <span class="pricing__unit">{{ t('pricing.perMonth') }}</span>
          </div>
          <p v-if="selectedPeriod > 1" class="pricing__billing">
            {{ PLAN_PRICES[plan][selectedPeriod].total.toLocaleString() }} ₽ / {{ selectedPeriod }} {{ t('pricing.billingMonths') }}
          </p>
        </div>

        <!-- Feature rows -->
        <ul class="pricing__feats">
          <li v-for="f in featuresTable" :key="f.key" class="pricing__feat">
            <div class="pricing__feat-left">
              <span class="pricing__feat-icon-wrap">
                <svg width="13" height="13" viewBox="0 0 24 24" v-html="f.svg" />
              </span>
              <span class="pricing__feat-label">{{ f.label }}</span>
            </div>
            <div class="pricing__feat-right">
              <span
                v-if="typeof getFeatureValue(plan, f.key) === 'string'"
                class="pricing__feat-num"
                :style="{ color: PLAN_META[plan].color }"
              >{{ getFeatureValue(plan, f.key) }}</span>
              <template v-else>
                <svg v-if="getFeatureValue(plan, f.key)" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" :fill="PLAN_META[plan].color + '20'"/>
                  <path d="M7.5 12L10.5 15L16.5 9" :stroke="PLAN_META[plan].color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="var(--fp-text-tertiary)" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </template>
            </div>
          </li>
        </ul>

        <!-- CTA -->
        <button
          class="pricing__cta"
          :class="`pricing__cta--${plan}`"
          :disabled="isCurrentPlan(plan) || loadingPlan !== null"
          @click="subscribe(plan)"
        >
          <span v-if="loadingPlan === plan" class="pricing__spinner" />
          <template v-else-if="isCurrentPlan(plan)">{{ t('pricing.currentPlan') }}</template>
          <template v-else>{{ t('pricing.selectPlan') }} {{ t(`planMeta.${plan}.name`) }}</template>
        </button>
      </div>
    </div>

    <!-- Free plan — full card -->
    <div class="pricing__free-card" :class="{ 'pricing__free-card--current': isCurrentPlan('free') }">
      <div class="pricing__free-top">
        <div>
          <h3 class="pricing__free-name">Free</h3>
          <p class="pricing__free-desc-title">{{ t('pricing.freeForever') }}</p>
        </div>
        <div class="pricing__free-right">
          <span v-if="isCurrentPlan('free')" class="pricing__free-current-badge">{{ t('pricing.currentBadge') }}</span>
          <span class="pricing__free-price">0 ₽</span>
        </div>
      </div>

      <button
        v-if="!isCurrentPlan('free')"
        class="pricing__free-downgrade"
        :disabled="downgradingFree"
        @click="downgradeFree"
      >
        <span v-if="downgradingFree" class="pricing__spinner" />
        <template v-else>{{ t('pricing.downgradeFree') }}</template>
      </button>

      <ul class="pricing__feats pricing__feats--free">
        <li v-for="f in featuresTable" :key="f.key" class="pricing__feat">
          <div class="pricing__feat-left">
            <span class="pricing__feat-icon-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" v-html="f.svg" />
            </span>
            <span class="pricing__feat-label">{{ f.label }}</span>
          </div>
          <div class="pricing__feat-right">
            <span v-if="typeof getFreeValue(f.key) === 'string'" class="pricing__feat-num pricing__feat-num--free">
              {{ getFreeValue(f.key) }}
            </span>
            <template v-else>
              <svg v-if="getFreeValue(f.key)" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" fill="rgba(34,197,94,0.15)"/>
                <path d="M7.5 12L10.5 15L16.5 9" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="var(--fp-text-tertiary)" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </template>
          </div>
        </li>
      </ul>
    </div>

  </div>
</template>

<style scoped>
.pricing {
  padding-bottom: 40px;
}

/* Header */
.pricing__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.pricing__back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}
.pricing__back:active { transform: scale(0.9); }

.pricing__title {
  font-size: 22px;
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

/* Test banner */
.pricing__test-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: color-mix(in srgb, #F59E0B 10%, var(--fp-bg-secondary));
  border: 1px solid color-mix(in srgb, #F59E0B 30%, transparent);
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
  margin-bottom: 18px;
}

.pricing__period {
  flex: 1;
  padding: 8px 2px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
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
  gap: 12px;
  margin-bottom: 14px;
}

.pricing__card {
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg);
  position: relative;
}

.pricing__card--popular {
  border-color: #8B5CF6;
  box-shadow: 0 6px 24px rgba(139,92,246,0.18);
}

.pricing__card--active {
  border-color: var(--fp-primary);
}

/* Badge */
.pricing__badge {
  position: absolute;
  top: 0;
  right: 14px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 0 0 10px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.pricing__badge--current { background: var(--fp-primary); color: #fff; }
.pricing__badge--popular { background: #8B5CF6; color: #fff; }

/* Card top */
.pricing__card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.pricing__card-top--start { background: linear-gradient(135deg, #1e40af, #3B82F6); }
.pricing__card-top--pro   { background: linear-gradient(135deg, #6d28d9, #8B5CF6); }
.pricing__card-top--max   { background: linear-gradient(135deg, #92400e, #F59E0B); }

.pricing__card-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 7px;
}

.pricing__card-icon svg { width: 100%; height: 100%; }

.pricing__card-label { flex: 1; }

.pricing__card-name {
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.pricing__card-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.68);
  margin-top: 3px;
}

.pricing__save-chip {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

/* Price */
.pricing__price-block {
  padding: 12px 16px 10px;
  border-bottom: 1px solid var(--fp-border);
}

.pricing__price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.pricing__amount {
  font-size: 30px;
  font-weight: 900;
  color: var(--fp-text);
  letter-spacing: -0.5px;
}

.pricing__unit {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.pricing__billing {
  font-size: 12px;
  color: var(--fp-text-tertiary);
  margin-top: 1px;
}

/* Feature rows */
.pricing__feats {
  padding: 4px 16px 8px;
}

.pricing__feat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid var(--fp-border);
}

.pricing__feat:last-child { border-bottom: none; }

.pricing__feat-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pricing__feat-icon-wrap {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fp-bg-secondary);
  border-radius: 6px;
  flex-shrink: 0;
}

.pricing__feat-label {
  font-size: 13px;
  color: var(--fp-text-secondary);
}

.pricing__feat-right {
  display: flex;
  align-items: center;
}

.pricing__feat-num {
  font-size: 16px;
  font-weight: 800;
}

.pricing__feat-num--free {
  color: var(--fp-text-secondary);
  font-size: 14px;
}


/* CTA */
.pricing__cta {
  display: block;
  width: calc(100% - 32px);
  margin: 10px 16px 16px;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  transition: opacity var(--fp-transition), transform var(--fp-transition);
}

.pricing__cta:active:not(:disabled) { opacity: 0.85; transform: scale(0.98); }
.pricing__cta:disabled { opacity: 0.55; cursor: default; }

.pricing__cta--start { background: linear-gradient(135deg, #1e40af, #3B82F6); }
.pricing__cta--pro   { background: linear-gradient(135deg, #6d28d9, #8B5CF6); }
.pricing__cta--max   { background: linear-gradient(135deg, #92400e, #F59E0B); }

.pricing__spinner {
  display: inline-block;
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ---- FREE CARD ---- */
.pricing__free-card {
  border-radius: 18px;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg);
  overflow: hidden;
}

.pricing__free-card--current {
  border-color: #94A3B8;
}

.pricing__free-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #334155, #475569);
}

.pricing__free-name {
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.pricing__free-desc-title {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-top: 3px;
}

.pricing__free-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pricing__free-current-badge {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(255,255,255,0.2);
  padding: 4px 10px;
  border-radius: 20px;
}

.pricing__free-price {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
}

.pricing__feats--free .pricing__feat-label {
  color: var(--fp-text-tertiary);
}

.pricing__free-downgrade {
  display: block;
  width: calc(100% - 32px);
  margin: 12px 16px 0;
  padding: 12px;
  border-radius: 10px;
  background: var(--fp-bg-secondary);
  border: 1.5px solid var(--fp-border);
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  text-align: center;
  transition: all var(--fp-transition);
}

.pricing__free-downgrade:active:not(:disabled) { opacity: 0.7; }
.pricing__free-downgrade:disabled { opacity: 0.4; cursor: default; }
</style>
