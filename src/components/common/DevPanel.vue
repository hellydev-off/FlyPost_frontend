<script setup lang="ts">
import { ref } from 'vue'
import { subscriptionApi } from '@/api/subscription.api'
import { usePlanStore } from '@/stores/usePlanStore'
import { useToastStore } from '@/stores/useToastStore'
import type { PlanKey } from '@/types/plan.types'

const planStore = usePlanStore()
const toast = useToastStore()

const open = ref(false)
const loading = ref<PlanKey | null>(null)

const PLANS: Array<{ key: PlanKey; label: string; color: string }> = [
  { key: 'free',  label: 'Free',  color: '#6b7280' },
  { key: 'start', label: 'Старт', color: '#3b82f6' },
  { key: 'pro',   label: 'Про',   color: '#8b5cf6' },
  { key: 'max',   label: 'Макс',  color: '#f59e0b' },
]

async function setPlan(plan: PlanKey): Promise<void> {
  if (loading.value) return
  loading.value = plan
  try {
    const status = await subscriptionApi.devSetPlan(plan)
    planStore.status = status
    toast.show(`Тариф → ${plan.toUpperCase()}`, 'success')
  } catch {
    toast.show('Ошибка смены тарифа', 'error')
  } finally {
    loading.value = null
  }
}
</script>

<template>
  <div class="dev-panel">
    <!-- Toggle button -->
    <button class="dev-panel__toggle" :class="{ 'dev-panel__toggle--open': open }" @click="open = !open">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
      DEV
    </button>

    <!-- Panel -->
    <Transition name="dev-slide">
      <div v-if="open" class="dev-panel__box">
        <div class="dev-panel__title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          Dev Tools
        </div>

        <div class="dev-panel__section-label">Тариф</div>

        <div class="dev-panel__plans">
          <button
            v-for="p in PLANS"
            :key="p.key"
            class="dev-panel__plan-btn"
            :class="{ 'dev-panel__plan-btn--active': planStore.effectivePlan === p.key }"
            :style="planStore.effectivePlan === p.key ? { background: p.color, borderColor: p.color } : { borderColor: p.color + '40', color: p.color }"
            :disabled="loading !== null"
            @click="setPlan(p.key)"
          >
            <span v-if="loading === p.key" class="dev-panel__spinner" />
            <span v-else>{{ p.label }}</span>
          </button>
        </div>

        <div class="dev-panel__current">
          Текущий: <strong>{{ planStore.effectivePlan }}</strong>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dev-panel {
  position: fixed;
  bottom: calc(var(--fp-bottom-nav-height) + var(--fp-tg-bottom-inset) + 12px);
  right: 12px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Toggle button */
.dev-panel__toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 20px;
  background: #1a1a2e;
  border: 1.5px solid rgba(139,92,246,0.5);
  color: #a78bfa;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  box-shadow: 0 2px 12px rgba(139,92,246,0.3);
  transition: all 0.15s;
}
.dev-panel__toggle--open {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: #fff;
}
.dev-panel__toggle:active { opacity: 0.8; }

/* Panel box */
.dev-panel__box {
  background: #0f0f1a;
  border: 1px solid rgba(139,92,246,0.3);
  border-radius: 14px;
  padding: 12px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.dev-panel__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.dev-panel__section-label {
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.dev-panel__plans {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.dev-panel__plan-btn {
  padding: 7px 8px;
  border-radius: 8px;
  border: 1.5px solid;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  min-height: 32px;
}
.dev-panel__plan-btn--active {
  color: #fff !important;
}
.dev-panel__plan-btn:disabled { opacity: 0.6; }
.dev-panel__plan-btn:not(:disabled):active { opacity: 0.7; transform: scale(0.95); }

.dev-panel__current {
  margin-top: 10px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  text-align: center;
}
.dev-panel__current strong {
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
}

.dev-panel__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transition */
.dev-slide-enter-active { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
.dev-slide-leave-active { transition: all 0.15s ease; }
.dev-slide-enter-from  { opacity: 0; transform: scale(0.85) translateY(8px); transform-origin: bottom right; }
.dev-slide-leave-to    { opacity: 0; transform: scale(0.9) translateY(4px); transform-origin: bottom right; }
</style>
