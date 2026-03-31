<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { HealthScoreData } from '@/types/analytics.types'

const props = defineProps<{ data: HealthScoreData }>()

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashOffset = computed(
  () => CIRCUMFERENCE - (props.data.score / 100) * CIRCUMFERENCE,
)

const scoreColor = computed(() => {
  if (props.data.score >= 70) return 'var(--fp-success)'
  if (props.data.score >= 40) return '#f59e0b'
  return 'var(--fp-error)'
})

const scoreLabel = computed(() => {
  if (props.data.score >= 70) return 'Отлично'
  if (props.data.score >= 40) return 'Хорошо'
  return 'Требует внимания'
})

const factors = computed(() => [
  { label: 'Регулярность', value: props.data.factors.regularity, hint: 'постов в неделю' },
  { label: 'Рост', value: props.data.factors.growth, hint: 'прирост подписчиков' },
  { label: 'Активность', value: props.data.factors.activity, hint: 'последние 7 дней' },
])
</script>

<template>
  <div class="health-card">
    <div class="health-card__header">
      <div class="health-card__title-row">
        <AppIcon name="heart" :size="18" color="var(--fp-primary)" />
        <span class="health-card__title">Здоровье канала</span>
      </div>
      <span class="health-card__label" :style="{ color: scoreColor }">{{ scoreLabel }}</span>
    </div>

    <div class="health-card__body">
      <!-- Circular gauge -->
      <div class="health-card__gauge">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" :r="RADIUS"
            fill="none"
            stroke="var(--fp-bg)"
            stroke-width="10"
          />
          <circle
            cx="50" cy="50" :r="RADIUS"
            fill="none"
            :stroke="scoreColor"
            stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 50 50)"
            class="health-card__arc"
          />
        </svg>
        <div class="health-card__score" :style="{ color: scoreColor }">{{ data.score }}</div>
      </div>

      <!-- Factor bars -->
      <div class="health-card__factors">
        <div v-for="f in factors" :key="f.label" class="health-card__factor">
          <div class="health-card__factor-row">
            <span class="health-card__factor-label">{{ f.label }}</span>
            <span class="health-card__factor-value">{{ f.value }}%</span>
          </div>
          <div class="health-card__bar">
            <div
              class="health-card__bar-fill"
              :style="{ width: f.value + '%', background: scoreColor }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
}

.health-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.health-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.health-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
}

.health-card__label {
  font-size: 13px;
  font-weight: 600;
}

.health-card__body {
  display: flex;
  align-items: center;
  gap: 20px;
}

.health-card__gauge {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
}

.health-card__arc {
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.health-card__score {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
}

.health-card__factors {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-card__factor-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.health-card__factor-label {
  font-size: 12px;
  color: var(--fp-text-secondary);
}

.health-card__factor-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text);
}

.health-card__bar {
  height: 4px;
  background: var(--fp-bg);
  border-radius: 2px;
  overflow: hidden;
}

.health-card__bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}
</style>
