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
import ChannelSwitcher from '@/components/common/ChannelSwitcher.vue'
import OnboardingCard from '@/components/home/OnboardingCard.vue'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { usePlanStore } from '@/stores/usePlanStore'
import { usePostsStore } from '@/stores/usePostsStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { PLAN_META } from '@/types/plan.types'

const router = useRouter()
const auth = useAuthStore()
const channelsStore = useChannelsStore()
const onboarding = useOnboardingStore()
const planStore = usePlanStore()
const postsStore = usePostsStore()
const { t } = useLocaleStore()

const stats = ref<ChannelStats | null>(null)
const streak = ref<StreakData | null>(null)
const healthScore = ref<HealthScoreData | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    await channelsStore.fetchChannels()
    const channelId = channelsStore.selectedChannelId
    await postsStore.fetchPosts(channelId ? { channelId } : undefined)
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
  } finally {
    loading.value = false
  }
})

function goToPost(id: string): void {
  router.push({ name: 'post-edit', params: { id } })
}
</script>

<template>
  <div class="home">
    <div class="home__header">
      <div>
        <p class="home__label">{{ t('home.welcome') }}</p>
        <h1 class="home__greeting">
          {{ auth.user?.firstName ?? t('home.user') }}
        </h1>
      </div>
      <div class="home__header-right">
        <button
          class="home__avatar"
          @click="router.push({ name: 'profile' })"
        >
          {{ auth.user?.firstName?.[0]?.toUpperCase() ?? '?' }}
          <span
            class="home__avatar-plan"
            :style="{ background: PLAN_META[planStore.effectivePlan].color }"
          >{{ planStore.effectivePlan }}</span>
        </button>
      </div>
    </div>

    <ChannelSwitcher class="home__channel-switcher" />

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
        <button v-if="streak && streak.streak > 0" class="home__streak" @click="router.push({ name: 'streak' })">
          <span class="home__streak-fire">🔥</span>
          <span class="home__streak-count">{{ streak.streak }}</span>
          <span class="home__streak-label">
            {{ streak.streak === 1 ? t('home.dayStreak1') : streak.streak < 5 ? t('home.dayStreak2') : t('home.dayStreak5') }}
          </span>
        </button>
        <div
          v-if="healthScore"
          class="home__health"
          :style="{ color: healthScore.score >= 70 ? 'var(--fp-success)' : healthScore.score >= 40 ? '#f59e0b' : 'var(--fp-error)' }"
          @click="router.push({ name: 'analytics' })"
        >
          <AppIcon name="heart" :size="16" color="currentColor" />
          <span class="home__health-score">{{ healthScore.score }}</span>
          <span class="home__health-label">{{ t('home.health') }}</span>
        </div>
      </div>

      <div class="home__stats stagger">
        <StatsCard :label="t('home.total')" :value="stats.total" />
        <StatsCard :label="t('home.published')" :value="stats.published" color="var(--fp-success)" />
        <StatsCard :label="t('home.scheduled')" :value="stats.scheduled" color="var(--fp-primary)" />
        <StatsCard :label="t('home.drafts')" :value="stats.drafts" />
      </div>

      <AppButton block class="mt" @click="router.push({ name: 'post-create' })">
        <AppIcon name="plus" :size="18" />
        {{ t('home.createPost') }}
      </AppButton>

      <div v-if="postsStore.draftPosts.length" class="home__drafts mt">
        <h2 class="home__section-title">{{ t('home.draftsSection') }}</h2>
        <div class="home__drafts-list stagger">
          <div
            v-for="post in postsStore.draftPosts.slice(0, 5)"
            :key="post.id"
            class="home__draft pressable"
            @click="goToPost(post.id)"
          >
            <AppIcon name="draft" :size="16" color="var(--fp-text-tertiary)" />
            <p class="home__draft-text">{{ post.content.slice(0, 80) || t('home.emptyDraft') }}</p>
            <AppIcon name="chevron-right" :size="14" color="var(--fp-text-tertiary)" />
          </div>
        </div>
      </div>

      <div v-if="stats.lastPosts.length" class="home__recent mt">
        <h2 class="home__section-title">{{ t('home.recentPosts') }}</h2>
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
      <p>{{ t('home.noChannel') }}</p>
      <AppButton @click="router.push({ name: 'channels' })">
        <AppIcon name="plus" :size="18" />
        {{ t('home.addChannel') }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.home__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.home__channel-switcher {
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

.home__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.home__avatar {
  position: relative;
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
  overflow: visible;
  margin-bottom: 6px;
}

.home__avatar:active {
  transform: scale(0.9);
}

.home__avatar-plan {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #fff;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
  line-height: 1.4;
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
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.home__streak:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.home__streak-fire {
  font-size: 18px;
  animation: fire-bob 1.8s ease-in-out infinite;
  display: inline-block;
}

@keyframes fire-bob {
  0%, 100% { transform: scaleY(1) rotate(-3deg); }
  50% { transform: scaleY(1.12) rotate(3deg); }
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

.home__drafts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.home__draft {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  cursor: pointer;
  transition: background var(--fp-transition);
}

.home__draft:active { background: var(--fp-bg-tertiary); }

.home__draft-text {
  flex: 1;
  font-size: 13px;
  color: var(--fp-text);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
