<script setup lang="ts">
import { onMounted } from 'vue'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import ScheduleCard from '@/components/scheduler/ScheduleCard.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'

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

    <div v-else-if="schedulerStore.scheduledPosts.length" class="scheduler-page__list mt">
      <ScheduleCard
        v-for="item in schedulerStore.scheduledPosts"
        :key="item.id"
        :item="item"
        @cancel="schedulerStore.cancelSchedule"
      />
    </div>

    <div v-else class="text-center text-hint mt">
      Нет запланированных публикаций
    </div>
  </div>
</template>

<style scoped>
.scheduler-page h1 {
  font-size: 24px;
  font-weight: 700;
}

.scheduler-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
