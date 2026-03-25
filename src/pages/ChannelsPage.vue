<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useChannelsStore } from '@/stores/useChannelsStore'
import ChannelCard from '@/components/channels/ChannelCard.vue'
import ChannelAddModal from '@/components/channels/ChannelAddModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'

const channelsStore = useChannelsStore()
const showAddModal = ref(false)

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
      <AppButton size="sm" @click="showAddModal = true">+ Добавить</AppButton>
    </div>

    <template v-if="channelsStore.loading">
      <div class="channels-page__list">
        <AppSkeleton v-for="i in 3" :key="i" height="80px" />
      </div>
    </template>

    <div v-else-if="channelsStore.channels.length" class="channels-page__list">
      <ChannelCard
        v-for="channel in channelsStore.channels"
        :key="channel.id"
        :channel="channel"
        @delete="channelsStore.deleteChannel"
        @select="channelsStore.selectChannel"
      />
    </div>

    <div v-else class="text-center text-hint mt">
      Нет подключённых каналов
    </div>

    <ChannelAddModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="onAdd"
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
}

.channels-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
