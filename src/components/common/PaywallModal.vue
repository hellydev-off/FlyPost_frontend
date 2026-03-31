<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '@/stores/usePlanStore'
import { LIMIT_MESSAGES } from '@/types/plan.types'

const router = useRouter()
const planStore = usePlanStore()

const limitCode = computed(() => planStore.paywallLimitCode ?? '')
const featureName = computed(() => LIMIT_MESSAGES[limitCode.value] ?? 'Эта функция')

const features = [
  {
    svg: `<path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    text: 'Безлимитный AI',
  },
  {
    svg: `<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    text: 'Планировщик',
  },
  {
    svg: `<path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    text: 'Полная аналитика',
  },
  {
    svg: `<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    text: 'Анализ конкурентов',
  },
  {
    svg: `<path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    text: 'Голосовой профиль',
  },
  {
    svg: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
    text: 'Безлимит каналов',
  },
]

function goToPricing(): void {
  planStore.hidePaywall()
  router.push({ name: 'pricing' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="paywall">
      <div v-if="planStore.paywallLimitCode" class="pw-overlay" @click.self="planStore.hidePaywall()">
        <div class="pw">
          <!-- Gradient header -->
          <div class="pw__header">
            <div class="pw__crown-wrap">
              <svg class="pw__crown-svg" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.12)"/>
                <path d="M8 32H40V35H8V32Z" fill="rgba(255,255,255,0.7)"/>
                <path d="M8 32L13 16L24 26L35 16L40 32H8Z" fill="white" fill-opacity="0.88" stroke="white" stroke-width="1" stroke-linejoin="round"/>
                <circle cx="13" cy="16" r="2.5" fill="#FFD700"/>
                <circle cx="24" cy="26" r="2.5" fill="#FFD700"/>
                <circle cx="35" cy="16" r="2.5" fill="#FFD700"/>
              </svg>
            </div>
            <h2 class="pw__title">Нужен тариф выше</h2>
            <p class="pw__desc">
              <span class="pw__feat-name">{{ featureName }}</span> — недоступно на вашем тарифе
            </p>
          </div>

          <!-- Features grid -->
          <div class="pw__features">
            <div v-for="f in features" :key="f.text" class="pw__feat">
              <div class="pw__feat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" v-html="f.svg" />
              </div>
              <span class="pw__feat-text">{{ f.text }}</span>
            </div>
          </div>

          <!-- CTA -->
          <button class="pw__cta" @click="goToPricing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Смотреть тарифы
          </button>
          <button class="pw__skip" @click="planStore.hidePaywall()">Позже</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pw-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9000;
  padding-bottom: max(env(safe-area-inset-bottom), 12px);
}

.pw {
  background: var(--fp-bg);
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-width: var(--fp-max-width);
  overflow: hidden;
}

/* Gradient header */
.pw__header {
  background: linear-gradient(160deg, #92400e 0%, #D97706 50%, #F59E0B 100%);
  padding: 28px 24px 24px;
  text-align: center;
}

.pw__crown-wrap {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  animation: crown-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.pw__crown-svg {
  width: 100%;
  height: 100%;
}

@keyframes crown-in {
  from { transform: scale(0.4) rotate(-20deg); opacity: 0; }
  to   { transform: scale(1) rotate(0deg); opacity: 1; }
}

.pw__title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 6px;
}

.pw__desc {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  line-height: 1.4;
}

.pw__feat-name {
  font-weight: 700;
  color: #fff;
}

/* Features grid */
.pw__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 18px 16px 14px;
}

.pw__feat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--fp-bg-secondary);
  border-radius: 12px;
}

.pw__feat-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(217,119,6,0.15), rgba(245,158,11,0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #D97706;
}

.pw__feat-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text);
  line-height: 1.3;
}

/* Actions */
.pw__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 32px);
  margin: 4px 16px 8px;
  padding: 15px;
  border-radius: 14px;
  background: linear-gradient(135deg, #D97706, #F59E0B);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  transition: opacity var(--fp-transition), transform var(--fp-transition);
  box-shadow: 0 4px 16px rgba(217,119,6,0.35);
}

.pw__cta:active { opacity: 0.85; transform: scale(0.98); }

.pw__skip {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--fp-text-tertiary);
  text-align: center;
  transition: opacity var(--fp-transition);
}

.pw__skip:active { opacity: 0.6; }

/* Transition */
.paywall-enter-active,
.paywall-leave-active {
  transition: opacity 0.3s ease;
}
.paywall-enter-active .pw,
.paywall-leave-active .pw {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.paywall-enter-from,
.paywall-leave-to {
  opacity: 0;
}
.paywall-enter-from .pw,
.paywall-leave-to .pw {
  transform: translateY(100%);
}
</style>
