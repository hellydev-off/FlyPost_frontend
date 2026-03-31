<script setup lang="ts">
import { onMounted } from 'vue'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import ScheduleCard from '@/components/scheduler/ScheduleCard.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const schedulerStore = useSchedulerStore()

onMounted(() => {
  schedulerStore.fetchScheduled()
})
</script>

<template>
  <div class="scheduler-page">
    <h1>Планировщик</h1>

    <template v-if="schedulerStore.loading">
      <div class="scheduler-page__list mt">
        <AppSkeleton v-for="i in 2" :key="i" height="100px" />
      </div>
    </template>

    <div v-else-if="schedulerStore.scheduledPosts.length" class="scheduler-page__list mt stagger">
      <ScheduleCard
        v-for="item in schedulerStore.scheduledPosts"
        :key="item.id"
        :item="item"
        @cancel="schedulerStore.cancelSchedule"
      />
    </div>

    <div v-else class="scheduler-page__empty">
      <AppIcon name="clock" :size="48" color="var(--fp-text-tertiary)" />
      <p>Нет запланированных публикаций</p>
    </div>
  </div>
</template>

<style scoped>
.scheduler-page h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.scheduler-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.scheduler-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  text-align: center;
}

.scheduler-page__empty p {
  font-size: 15px;
  color: var(--fp-text-secondary);
}
</style>
