<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { analyticsApi } from '@/api/analytics.api'
import type { ChannelStats } from '@/types/analytics.types'
import StatsCard from '@/components/analytics/StatsCard.vue'
import PostsChart from '@/components/analytics/PostsChart.vue'
import PostCard from '@/components/posts/PostCard.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const channelsStore = useChannelsStore()
const stats = ref<ChannelStats | null>(null)
const loading = ref(true)
const selectedId = ref('')

onMounted(async () => {
  await channelsStore.fetchChannels()
  if (channelsStore.selectedChannelId) {
    selectedId.value = channelsStore.selectedChannelId
  }
})

watch(selectedId, async (id) => {
  if (!id) return
  loading.value = true
  try {
    stats.value = await analyticsApi.getStats(id)
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="analytics-page">
    <h1>Аналитика</h1>

    <div class="analytics-page__channel mt">
      <select v-model="selectedId" class="analytics-page__select">
        <option value="" disabled>Выберите канал</option>
        <option
          v-for="ch in channelsStore.channels"
          :key="ch.id"
          :value="ch.id"
        >
          {{ ch.title }}
        </option>
      </select>
    </div>

    <AppLoader v-if="loading" />

    <template v-else-if="stats">
      <div class="analytics-page__stats mt">
        <StatsCard label="Всего" :value="stats.total" />
        <StatsCard label="Опубликовано" :value="stats.published" color="var(--fp-success)" />
        <StatsCard label="Запланировано" :value="stats.scheduled" color="var(--fp-info)" />
        <StatsCard label="Черновики" :value="stats.drafts" />
      </div>

      <div class="mt">
        <PostsChart
          :published="stats.published"
          :scheduled="stats.scheduled"
          :drafts="stats.drafts"
        />
      </div>

      <div v-if="stats.lastPosts.length" class="mt">
        <h2 class="analytics-page__subtitle">Последние посты</h2>
        <div class="analytics-page__posts">
          <PostCard
            v-for="post in stats.lastPosts"
            :key="post.id"
            :post="post"
            @click="router.push({ name: 'post-edit', params: { id: $event } })"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analytics-page h1 {
  font-size: 24px;
  font-weight: 700;
}

.analytics-page__select {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
  appearance: none;
  width: 100%;
}

.analytics-page__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fp-spacing-sm);
}

.analytics-page__subtitle {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: var(--fp-spacing-sm);
}

.analytics-page__posts {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
