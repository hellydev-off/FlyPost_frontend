import { defineStore } from 'pinia'
import { ref } from 'vue'
import { channelProfileApi } from '@/api/channelProfile.api'
import { useToastStore } from './useToastStore'
import type { ChannelProfile, UpdateChannelProfilePayload } from '@/types/channel.types'

export const useChannelProfileStore = defineStore('channelProfile', () => {
  const profiles = ref<Record<string, ChannelProfile>>({})
  const loading = ref(false)

  async function fetch(channelId: string): Promise<void> {
    loading.value = true
    try {
      profiles.value[channelId] = await channelProfileApi.get(channelId)
    } catch {
      useToastStore().show('Не удалось загрузить профиль канала', 'error')
    } finally {
      loading.value = false
    }
  }

  async function save(channelId: string, payload: UpdateChannelProfilePayload): Promise<void> {
    try {
      profiles.value[channelId] = await channelProfileApi.update(channelId, payload)
      useToastStore().show('Профиль голоса сохранён', 'success')
    } catch {
      useToastStore().show('Не удалось сохранить профиль', 'error')
    }
  }

  function getProfile(channelId: string): ChannelProfile | null {
    return profiles.value[channelId] ?? null
  }

  return { profiles, loading, fetch, save, getProfile }
})
