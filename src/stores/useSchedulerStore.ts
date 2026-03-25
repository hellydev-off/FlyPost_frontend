import { defineStore } from 'pinia'
import { ref } from 'vue'
import { schedulerApi } from '@/api/scheduler.api'
import { useToastStore } from './useToastStore'
import type { ScheduledPost, CreateSchedulePayload, UpdateSchedulePayload } from '@/types/scheduler.types'

export const useSchedulerStore = defineStore('scheduler', () => {
  const scheduledPosts = ref<ScheduledPost[]>([])
  const loading = ref(false)

  async function fetchScheduled(): Promise<void> {
    loading.value = true
    try {
      scheduledPosts.value = await schedulerApi.getAll()
    } catch {
      useToastStore().show('Не удалось загрузить расписание', 'error')
    } finally {
      loading.value = false
    }
  }

  async function schedulePost(payload: CreateSchedulePayload): Promise<void> {
    try {
      const item = await schedulerApi.schedule(payload)
      scheduledPosts.value.push(item)
      useToastStore().show('Пост запланирован', 'success')
    } catch {
      useToastStore().show('Не удалось запланировать пост', 'error')
    }
  }

  async function updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<void> {
    try {
      const updated = await schedulerApi.update(id, payload)
      const idx = scheduledPosts.value.findIndex(s => s.id === id)
      if (idx !== -1) scheduledPosts.value[idx] = updated
      useToastStore().show('Расписание обновлено', 'success')
    } catch {
      useToastStore().show('Не удалось обновить расписание', 'error')
    }
  }

  async function cancelSchedule(id: string): Promise<void> {
    try {
      await schedulerApi.cancel(id)
      scheduledPosts.value = scheduledPosts.value.filter(s => s.id !== id)
      useToastStore().show('Публикация отменена', 'success')
    } catch {
      useToastStore().show('Не удалось отменить публикацию', 'error')
    }
  }

  return {
    scheduledPosts, loading,
    fetchScheduled, schedulePost, updateSchedule, cancelSchedule,
  }
})
