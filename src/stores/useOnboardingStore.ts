import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChannelsStore } from './useChannelsStore'
import { profileApi } from '@/api/profile.api'

export const useOnboardingStore = defineStore('onboarding', () => {
  const DISMISS_KEY = 'fp_onboarding_dismissed'

  const dismissed = ref(localStorage.getItem(DISMISS_KEY) === '1')
  const postsCount = ref(0)
  const scheduledCount = ref(0)

  const channelsStore = useChannelsStore()

  const steps = computed(() => [
    {
      key: 'channel',
      label: 'Добавьте Telegram-канал',
      done: channelsStore.channels.length > 0,
      route: { name: 'channels' },
    },
    {
      key: 'post',
      label: 'Создайте первый пост',
      done: postsCount.value > 0,
      route: { name: 'post-create' },
    },
    {
      key: 'scheduled',
      label: 'Запланируйте публикацию',
      done: scheduledCount.value > 0,
      route: { name: 'post-create' },
    },
  ])

  const doneCount = computed(() => steps.value.filter(s => s.done).length)
  const allDone = computed(() => doneCount.value === steps.value.length)

  async function load(): Promise<void> {
    try {
      const stats = await profileApi.getStats()
      postsCount.value = stats.posts
      scheduledCount.value = stats.scheduled
    } catch {
      // fail silently
    }
  }

  function dismiss(): void {
    dismissed.value = true
    localStorage.setItem(DISMISS_KEY, '1')
  }

  return { dismissed, steps, doneCount, allDone, load, dismiss }
})
