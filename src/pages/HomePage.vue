<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { analyticsApi } from '@/api/analytics.api'
import type { ChannelStats } from '@/types/analytics.types'
import StatsCard from '@/components/analytics/StatsCard.vue'
import PostCard from '@/components/posts/PostCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'

const router = useRouter()
const auth = useAuthStore()
const channelsStore = useChannelsStore()

const stats = ref<ChannelStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  await channelsStore.fetchChannels()
  if (channelsStore.selectedChannelId) {
    stats.value = await analyticsApi.getStats(channelsStore.selectedChannelId)
  }
  loading.value = false
})

function goToPost(id: string): void {
  router.push({ name: 'post-edit', params: { id } })
}
</script>

<template>
  <div class="home">
    <h1 class="home__greeting">
      Привет, {{ auth.user?.first_name ?? 'пользователь' }}!
    </h1>

    <template v-if="loading">
      <div class="home__stats">
        <AppSkeleton v-for="i in 4" :key="i" height="80px" />
      </div>
      <AppSkeleton height="100px" class="mt" />
    </template>

    <template v-else-if="stats">
      <div class="home__stats">
        <StatsCard label="Всего" :value="stats.total" />
        <StatsCard label="Опубликовано" :value="stats.published" color="var(--fp-success)" />
        <StatsCard label="Запланировано" :value="stats.scheduled" color="var(--fp-info)" />
        <StatsCard label="Черновики" :value="stats.drafts" />
      </div>

      <AppButton block class="mt" @click="router.push({ name: 'post-create' })">
        Создать пост
      </AppButton>

      <div v-if="stats.lastPosts.length" class="home__recent mt">
        <h2 class="home__section-title">Последние посты</h2>
        <div class="home__posts">
          <PostCard
            v-for="post in stats.lastPosts.slice(0, 3)"
            :key="post.id"
            :post="post"
            @click="goToPost"
          />
        </div>
      </div>
    </template>

    <div v-else class="text-center text-hint mt">
      Добавьте канал, чтобы начать работу
    </div>
  </div>
</template>

<style scoped>
.home__greeting {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--fp-spacing);
}

.home__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fp-spacing-sm);
}

.home__section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: var(--fp-spacing-sm);
}

.home__posts {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
