<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { analyticsApi } from '@/api/analytics.api'
import type { ChannelStats, StreakData, HealthScoreData } from '@/types/analytics.types'
import StatsCard from '@/components/analytics/StatsCard.vue'
import PostCard from '@/components/posts/PostCard.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import OnboardingCard from '@/components/home/OnboardingCard.vue'
import { useOnboardingStore } from '@/stores/useOnboardingStore'

const router = useRouter()
const auth = useAuthStore()
const channelsStore = useChannelsStore()
const onboarding = useOnboardingStore()

const stats = ref<ChannelStats | null>(null)
const streak = ref<StreakData | null>(null)
const healthScore = ref<HealthScoreData | null>(null)
const loading = ref(true)

onMounted(async () => {
  await channelsStore.fetchChannels()
  const channelId = channelsStore.selectedChannelId
  if (channelId) {
    const [s, st, hs] = await Promise.all([
      analyticsApi.getStats(channelId),
      analyticsApi.getStreak(channelId),
      analyticsApi.getHealthScore(channelId),
    ])
    stats.value = s
    streak.value = st
    healthScore.value = hs
  }
  loading.value = false
})

function goToPost(id: string): void {
  router.push({ name: 'post-edit', params: { id } })
}
</script>

<template>
  <div class="home">
    <div class="home__header">
      <div>
        <p class="home__label">Добро пожаловать</p>
        <h1 class="home__greeting">
          {{ auth.user?.firstName ?? 'Пользователь' }}
        </h1>
      </div>
      <button class="home__avatar" @click="router.push({ name: 'profile' })">
        {{ auth.user?.firstName?.[0]?.toUpperCase() ?? '?' }}
      </button>
    </div>

    <OnboardingCard v-if="!onboarding.allDone && !onboarding.dismissed" />

    <template v-if="loading">
      <div class="home__stats">
        <AppSkeleton v-for="i in 4" :key="i" height="80px" />
      </div>
      <AppSkeleton height="100px" class="mt" />
    </template>

    <template v-else-if="stats">
      <!-- Streak + Health Score row -->
      <div v-if="streak || healthScore" class="home__insights">
        <div v-if="streak && streak.streak > 0" class="home__streak">
          <AppIcon name="fire" :size="18" color="#f59e0b" />
          <span class="home__streak-count">{{ streak.streak }}</span>
          <span class="home__streak-label">
            {{ streak.streak === 1 ? 'день подряд' : streak.streak < 5 ? 'дня подряд' : 'дней подряд' }}
          </span>
        </div>
        <div
          v-if="healthScore"
          class="home__health"
          :style="{ color: healthScore.score >= 70 ? 'var(--fp-success)' : healthScore.score >= 40 ? '#f59e0b' : 'var(--fp-error)' }"
          @click="router.push({ name: 'analytics' })"
        >
          <AppIcon name="heart" :size="16" color="currentColor" />
          <span class="home__health-score">{{ healthScore.score }}</span>
          <span class="home__health-label">здоровье</span>
        </div>
      </div>

      <div class="home__stats stagger">
        <StatsCard label="Всего" :value="stats.total" />
        <StatsCard label="Опубликовано" :value="stats.published" color="var(--fp-success)" />
        <StatsCard label="Запланировано" :value="stats.scheduled" color="var(--fp-primary)" />
        <StatsCard label="Черновики" :value="stats.drafts" />
      </div>

      <AppButton block class="mt" @click="router.push({ name: 'post-create' })">
        <AppIcon name="plus" :size="18" />
        Создать пост
      </AppButton>

      <div v-if="stats.lastPosts.length" class="home__recent mt">
        <h2 class="home__section-title">Последние посты</h2>
        <div class="home__posts stagger">
          <PostCard
            v-for="post in stats.lastPosts.slice(0, 3)"
            :key="post.id"
            :post="post"
            @click="goToPost"
          />
        </div>
      </div>
    </template>

    <div v-else class="home__empty">
      <AppIcon name="channels" :size="48" color="var(--fp-text-tertiary)" />
      <p>Добавьте канал, чтобы начать работу</p>
      <AppButton @click="router.push({ name: 'channels' })">
        <AppIcon name="plus" :size="18" />
        Добавить канал
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.home__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--fp-spacing-lg);
}

.home__label {
  font-size: 14px;
  color: var(--fp-text-secondary);
  margin-bottom: 2px;
}

.home__greeting {
  font-size: 26px;
  font-weight: 800;
  color: var(--fp-text);
}

.home__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.home__avatar:active {
  transform: scale(0.9);
}

.home__insights {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--fp-spacing);
}

.home__streak {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: color-mix(in srgb, #f59e0b 10%, var(--fp-bg-secondary));
  border-radius: 20px;
  border: 1.5px solid color-mix(in srgb, #f59e0b 25%, transparent);
}

.home__streak-count {
  font-size: 16px;
  font-weight: 800;
  color: #f59e0b;
}

.home__streak-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fp-text-secondary);
}

.home__health {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--fp-bg-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: opacity var(--fp-transition);
}

.home__health:active {
  opacity: 0.7;
}

.home__health-score {
  font-size: 16px;
  font-weight: 800;
}

.home__health-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fp-text-secondary);
}

.home__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fp-spacing-sm);
}

.home__section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: var(--fp-spacing-sm);
}

.home__posts {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.home__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  text-align: center;
}

.home__empty p {
  font-size: 15px;
  color: var(--fp-text-secondary);
}
</style>
