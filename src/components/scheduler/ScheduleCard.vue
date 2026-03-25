<script setup lang="ts">
import type { ScheduledPost } from '@/types/scheduler.types'
import { formatDateTime } from '@/utils/formatDate'
import AppButton from '@/components/common/AppButton.vue'

defineProps<{
  item: ScheduledPost
}>()

defineEmits<{
  cancel: [id: string]
}>()
</script>

<template>
  <div class="schedule-card">
    <div class="schedule-card__content">{{ item.content }}</div>
    <div class="schedule-card__meta">
      <span class="text-hint">{{ formatDateTime(item.scheduledAt) }}</span>
      <AppButton variant="danger" size="sm" @click="$emit('cancel', item.id)">
        Отменить
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
}

.schedule-card__content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--fp-spacing-sm);
}

.schedule-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
