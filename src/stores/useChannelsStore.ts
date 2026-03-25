import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { channelsApi } from '@/api/channels.api'
import { useToastStore } from './useToastStore'
import type { Channel, CreateChannelPayload } from '@/types/channel.types'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])
  const loading = ref(false)
  const selectedChannelId = ref<string | null>(null)

  const selectedChannel = computed(() =>
    channels.value.find(c => c.id === selectedChannelId.value) ?? null,
  )

  async function fetchChannels(): Promise<void> {
    loading.value = true
    try {
      channels.value = await channelsApi.getAll()
      if (!selectedChannelId.value && channels.value.length > 0) {
        selectedChannelId.value = channels.value[0].id
      }
    } catch {
      useToastStore().show('Не удалось загрузить каналы', 'error')
    } finally {
      loading.value = false
    }
  }

  async function addChannel(payload: CreateChannelPayload): Promise<void> {
    try {
      const channel = await channelsApi.addChannel(payload)
      channels.value.push(channel)
      useToastStore().show('Канал добавлен', 'success')
    } catch {
      useToastStore().show('Не удалось добавить канал', 'error')
    }
  }

  async function deleteChannel(id: string): Promise<void> {
    try {
      await channelsApi.deleteChannel(id)
      channels.value = channels.value.filter(c => c.id !== id)
      if (selectedChannelId.value === id) {
        selectedChannelId.value = channels.value[0]?.id ?? null
      }
      useToastStore().show('Канал удалён', 'success')
    } catch {
      useToastStore().show('Не удалось удалить канал', 'error')
    }
  }

  function selectChannel(id: string): void {
    selectedChannelId.value = id
  }

  return {
    channels, loading, selectedChannelId, selectedChannel,
    fetchChannels, addChannel, deleteChannel, selectChannel,
  }
})
