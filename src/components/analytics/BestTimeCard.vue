<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue'
import type { BestTimeData } from '@/types/analytics.types'

defineProps<{ data: BestTimeData }>()

function formatHour(hour: number): string {
  const h = String(hour).padStart(2, '0')
  const next = String((hour + 1) % 24).padStart(2, '0')
  return `${h}:00 – ${next}:00`
}
</script>

<template>
  <div class="best-time-card">
    <div class="best-time-card__header">
      <AppIcon name="clock" :size="18" color="var(--fp-primary)" />
      <span class="best-time-card__title">Лучшее время для публикации</span>
    </div>

    <div v-if="!data.hasEnoughData" class="best-time-card__empty">
      <AppIcon name="info-circle" :size="20" color="var(--fp-text-tertiary)" />
      <span>Опубликуйте не менее 3 постов, чтобы увидеть рекомендации</span>
    </div>

    <div v-else class="best-time-card__slots">
      <div
        v-for="(slot, i) in data.slots"
        :key="slot.hour"
        class="best-time-card__slot"
        :class="{ 'best-time-card__slot--top': i === 0 }"
      >
        <div class="best-time-card__slot-rank">{{ i + 1 }}</div>
        <div class="best-time-card__slot-info">
          <span class="best-time-card__slot-time">{{ formatHour(slot.hour) }}</span>
          <span class="best-time-card__slot-meta">
            {{ slot.postsCount }} {{ slot.postsCount === 1 ? 'публикация' : 'публикаций' }}
            <template v-if="slot.avgGrowth !== null">
              · прирост
              <span
                class="best-time-card__growth"
                :class="slot.avgGrowth >= 0 ? 'best-time-card__growth--pos' : 'best-time-card__growth--neg'"
              >{{ slot.avgGrowth >= 0 ? '+' : '' }}{{ slot.avgGrowth }}</span>
            </template>
          </span>
        </div>
        <AppIcon v-if="i === 0" name="trending-up" :size="18" color="var(--fp-success)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.best-time-card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
}

.best-time-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.best-time-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
}

.best-time-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--fp-text-tertiary);
  padding: 4px 0;
}

.best-time-card__slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.best-time-card__slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--fp-bg);
  border-radius: calc(var(--fp-radius) - 4px);
  border: 1.5px solid transparent;
}

.best-time-card__slot--top {
  border-color: var(--fp-success);
  background: color-mix(in srgb, var(--fp-success) 6%, var(--fp-bg));
}

.best-time-card__slot-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--fp-text-secondary);
  flex-shrink: 0;
}

.best-time-card__slot--top .best-time-card__slot-rank {
  background: var(--fp-success);
  color: #fff;
}

.best-time-card__slot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.best-time-card__slot-time {
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text);
}

.best-time-card__slot-meta {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.best-time-card__growth {
  font-weight: 600;
}

.best-time-card__growth--pos {
  color: var(--fp-success);
}

.best-time-card__growth--neg {
  color: var(--fp-error);
}
</style>
