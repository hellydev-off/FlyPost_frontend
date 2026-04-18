import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { channelsApi } from '@/api/channels.api'
import { useToastStore } from './useToastStore'
import { useLocaleStore } from './useLocaleStore'
import type { Channel, CreateChannelPayload } from '@/types/channel.types'

const STORAGE_KEY = 'fp_selected_channel'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])
  const loading = ref(false)
  const selectedChannelId = ref<string | null>(localStorage.getItem(STORAGE_KEY))

  const selectedChannel = computed(() =>
    channels.value.find(c => c.id === selectedChannelId.value) ?? null,
  )

  async function fetchChannels(): Promise<void> {
    loading.value = true
    try {
      channels.value = await channelsApi.getAll()
      // Восстанавливаем из localStorage, но только если канал ещё существует
      const saved = selectedChannelId.value
      const exists = saved && channels.value.some(c => c.id === saved)
      if (!exists) {
        selectedChannelId.value = channels.value[0]?.id ?? null
        if (selectedChannelId.value) localStorage.setItem(STORAGE_KEY, selectedChannelId.value)
        else localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      useToastStore().show(useLocaleStore().t('stores.channels.fetchError'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function addChannel(payload: CreateChannelPayload): Promise<void> {
    try {
      const channel = await channelsApi.addChannel(payload)
      channels.value.push(channel)
      useToastStore().show(useLocaleStore().t('stores.channels.added'), 'success')
    } catch {
      useToastStore().show(useLocaleStore().t('stores.channels.addError'), 'error')
    }
  }

  async function deleteChannel(id: string): Promise<void> {
    try {
      await channelsApi.deleteChannel(id)
      channels.value = channels.value.filter(c => c.id !== id)
      if (selectedChannelId.value === id) {
        selectedChannelId.value = channels.value[0]?.id ?? null
        if (selectedChannelId.value) localStorage.setItem(STORAGE_KEY, selectedChannelId.value)
        else localStorage.removeItem(STORAGE_KEY)
      }
      useToastStore().show(useLocaleStore().t('stores.channels.deleted'), 'success')
    } catch {
      useToastStore().show(useLocaleStore().t('stores.channels.deleteError'), 'error')
    }
  }

  function selectChannel(id: string): void {
    selectedChannelId.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  return {
    channels, loading, selectedChannelId, selectedChannel,
    fetchChannels, addChannel, deleteChannel, selectChannel,
  }
})
