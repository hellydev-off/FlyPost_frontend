<script setup lang="ts">
import type { ScheduledPost } from '@/types/scheduler.types'
import { formatDateTime } from '@/utils/formatDate'
import AppIcon from '@/components/common/AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

defineProps<{
  item: ScheduledPost
}>()

defineEmits<{
  cancel: [id: string]
}>()

const { t } = useLocaleStore()

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return t('scheduleCard.now')
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return t('scheduleCard.inDays', { n: days })
  if (hours > 0) return t('scheduleCard.inHours', { n: hours })
  const minutes = Math.floor(diff / 60_000)
  return t('scheduleCard.inMinutes', { n: minutes })
}
</script>

<template>
  <div class="schedule-card">
    <div class="schedule-card__timeline">
      <span class="schedule-card__time-dot" />
      <span class="schedule-card__time-line" />
    </div>
    <div class="schedule-card__body">
      <div class="schedule-card__header">
        <span class="schedule-card__date">{{ formatDateTime(item.scheduledAt) }}</span>
        <span class="schedule-card__countdown">{{ timeUntil(item.scheduledAt) }}</span>
      </div>
      <p class="schedule-card__content">{{ item.content }}</p>
      <div class="schedule-card__footer">
        <button class="schedule-card__cancel" @click="$emit('cancel', item.id)">
          <AppIcon name="close" :size="14" />
          <span>{{ t('scheduleCard.cancel') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  display: flex;
  gap: 12px;
}

.schedule-card__timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
}

.schedule-card__time-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--fp-primary);
  flex-shrink: 0;
  box-shadow: 0 0 0 4px var(--fp-primary-bg);
}

.schedule-card__time-line {
  width: 2px;
  flex: 1;
  background: var(--fp-border);
  margin-top: 4px;
}

.schedule-card__body {
  flex: 1;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border-left: 3px solid var(--fp-primary);
}

.schedule-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.schedule-card__date {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
}

.schedule-card__countdown {
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-primary);
  background: var(--fp-primary-bg);
  padding: 3px 10px;
  border-radius: 12px;
}

.schedule-card__content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--fp-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}

.schedule-card__footer {
  display: flex;
  justify-content: flex-end;
}

.schedule-card__cancel {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--fp-radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-error);
  background: var(--fp-error-bg);
  transition: all var(--fp-transition);
}

.schedule-card__cancel:active {
  transform: scale(0.95);
}
</style>
