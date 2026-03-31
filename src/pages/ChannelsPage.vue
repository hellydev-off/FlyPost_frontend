<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChannelsStore } from '@/stores/useChannelsStore'
import ChannelCard from '@/components/channels/ChannelCard.vue'
import ChannelAddModal from '@/components/channels/ChannelAddModal.vue'
import ChannelVoiceModal from '@/components/channels/ChannelVoiceModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const channelsStore = useChannelsStore()
const showAddModal = ref(false)
const voiceChannelId = ref<string | null>(null)

const voiceChannel = () => channelsStore.channels.find(c => c.id === voiceChannelId.value) ?? null

onMounted(() => {
  channelsStore.fetchChannels()
})

function onAdd(payload: { telegramChannelId: string; title: string }): void {
  channelsStore.addChannel(payload)
  showAddModal.value = false
}
</script>

<template>
  <div class="channels-page">
    <div class="channels-page__header">
      <h1>Каналы</h1>
      <AppButton size="sm" @click="showAddModal = true">
        <AppIcon name="plus" :size="16" />
        Добавить
      </AppButton>
    </div>

    <template v-if="channelsStore.loading">
      <div class="channels-page__list">
        <AppSkeleton v-for="i in 3" :key="i" height="80px" />
      </div>
    </template>

    <div v-else-if="channelsStore.channels.length" class="channels-page__list stagger">
      <ChannelCard
        v-for="channel in channelsStore.channels"
        :key="channel.id"
        :channel="channel"
        @delete="channelsStore.deleteChannel"
        @select="channelsStore.selectChannel"
        @profile="(id) => { voiceChannelId = id }"
      />
    </div>

    <div v-else class="channels-page__empty">
      <AppIcon name="channels" :size="48" color="var(--fp-text-tertiary)" />
      <p>Нет подключённых каналов</p>
      <AppButton @click="showAddModal = true">
        <AppIcon name="plus" :size="18" />
        Добавить канал
      </AppButton>
    </div>

    <ChannelAddModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="onAdd"
    />

    <ChannelVoiceModal
      v-if="voiceChannelId && voiceChannel()"
      :channel-id="voiceChannelId"
      :channel-title="voiceChannel()!.title"
      @close="voiceChannelId = null"
    />
  </div>
</template>

<style scoped>
.channels-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--fp-spacing);
}

.channels-page__header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.channels-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.channels-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  text-align: center;
}

.channels-page__empty p {
  font-size: 15px;
  color: var(--fp-text-secondary);
}
</style>
