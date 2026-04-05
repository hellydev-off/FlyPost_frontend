import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChannelsStore } from './useChannelsStore'
import { useLocaleStore } from './useLocaleStore'
import { profileApi } from '@/api/profile.api'

export const useOnboardingStore = defineStore('onboarding', () => {
  const DISMISS_KEY = 'fp_onboarding_dismissed'

  const dismissed = ref(localStorage.getItem(DISMISS_KEY) === '1')
  const postsCount = ref(0)
  const scheduledCount = ref(0)

  const channelsStore = useChannelsStore()
  const locale = useLocaleStore()

  const steps = computed(() => [
    {
      key: 'channel',
      label: locale.t('onboarding.stepChannel'),
      done: channelsStore.channels.length > 0,
      route: { name: 'channels' },
    },
    {
      key: 'post',
      label: locale.t('onboarding.stepPost'),
      done: postsCount.value > 0,
      route: { name: 'post-create' },
    },
    {
      key: 'scheduled',
      label: locale.t('onboarding.stepScheduled'),
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
