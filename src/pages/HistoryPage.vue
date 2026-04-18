<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { aiApi } from '@/api/ai.api'
import { usePostsStore } from '@/stores/usePostsStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import PostStatusBadge from '@/components/posts/PostStatusBadge.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import ChannelSwitcher from '@/components/common/ChannelSwitcher.vue'
import type { AiPlan, DailyPlanIdea, WeeklyPlanIdea } from '@/types/competitor.types'

type Tab = 'posts' | 'daily' | 'weekly'

const router = useRouter()
const route = useRoute()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()

const tabFromQuery = route.query.tab
const activeTab = ref<Tab>(
  tabFromQuery === 'daily' ? 'daily' : tabFromQuery === 'weekly' ? 'weekly' : 'posts'
)
const dailyPlans = ref<AiPlan[]>([])
const weeklyPlans = ref<AiPlan[]>([])
const loadingPlans = ref(false)
const expandedPlanId = ref<string | null>(null)
const creatingDraftKey = ref<string | null>(null) // `${planId}-${ideaIndex}`

onMounted(async () => {
  await postsStore.fetchPosts()
  loadAiPlans()
})

async function loadAiPlans(): Promise<void> {
  loadingPlans.value = true
  try {
    const [daily, weekly] = await Promise.all([
      aiApi.getPlans({ type: 'daily' }),
      aiApi.getPlans({ type: 'weekly' }),
    ])
    dailyPlans.value = daily
    weeklyPlans.value = weekly
  } finally {
    loadingPlans.value = false
  }
}

const filteredPosts = computed(() => {
  const posts = postsStore.posts
  if (!channelsStore.selectedChannelId) return posts
  return posts.filter(p => p.channelId === channelsStore.selectedChannelId)
})

const filteredDailyPlans = computed(() => {
  if (!channelsStore.selectedChannelId) return dailyPlans.value
  return dailyPlans.value.filter(p => p.channelId === channelsStore.selectedChannelId)
})

const filteredWeeklyPlans = computed(() => {
  if (!channelsStore.selectedChannelId) return weeklyPlans.value
  return weeklyPlans.value.filter(p => p.channelId === channelsStore.selectedChannelId)
})

function togglePlan(id: string): void {
  expandedPlanId.value = expandedPlanId.value === id ? null : id
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function goToPost(id: string): void {
  router.push({ name: 'post-edit', params: { id } })
}

function isDailyIdea(idea: DailyPlanIdea | WeeklyPlanIdea): idea is DailyPlanIdea {
  return 'scheduledTime' in idea
}

async function createDraftFromIdea(plan: AiPlan, idea: DailyPlanIdea | WeeklyPlanIdea, idx: number): Promise<void> {
  const key = `${plan.id}-${idx}`
  creatingDraftKey.value = key
  try {
    const content = `${idea.title}\n\n${idea.summary}`
    const post = await postsStore.createPost({ channelId: plan.channelId, content })
    if (post) {
      router.push({ name: 'post-edit', params: { id: post.id } })
    }
  } finally {
    creatingDraftKey.value = null
  }
}
</script>

<template>
  <div class="history-page">
    <div class="history-page__header">
      <button class="history-page__back" @click="router.back()">
        <AppIcon name="chevron-left" :size="20" />
      </button>
      <h1>История</h1>
      <ChannelSwitcher />
    </div>

    <!-- Tabs -->
    <div class="history-page__tabs">
      <button
        class="history-page__tab"
        :class="{ 'history-page__tab--active': activeTab === 'posts' }"
        @click="activeTab = 'posts'"
      >
        Посты
      </button>
      <button
        class="history-page__tab"
        :class="{ 'history-page__tab--active': activeTab === 'daily' }"
        @click="activeTab = 'daily'"
      >
        Планы дня
      </button>
      <button
        class="history-page__tab"
        :class="{ 'history-page__tab--active': activeTab === 'weekly' }"
        @click="activeTab = 'weekly'"
      >
        Планы недели
      </button>
    </div>

    <!-- Posts tab -->
    <div v-if="activeTab === 'posts'" class="history-page__content">
      <div v-if="filteredPosts.length" class="history-list stagger">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="history-post pressable"
          @click="goToPost(post.id)"
        >
          <div class="history-post__meta">
            <PostStatusBadge :status="post.status" />
            <span class="history-post__date">{{ formatDate(post.publishedAt ?? post.createdAt) }}</span>
            <AppIcon name="chevron-right" :size="14" />
          </div>
          <p class="history-post__text">{{ post.content.slice(0, 120) }}</p>
        </div>
      </div>
      <p v-else class="history-page__empty">Постов пока нет</p>
    </div>

    <!-- Daily plans tab -->
    <div v-else-if="activeTab === 'daily'" class="history-page__content">
      <AppSkeleton v-if="loadingPlans" height="120px" />
      <template v-else>
        <div v-if="filteredDailyPlans.length" class="history-list stagger">
          <div v-for="plan in filteredDailyPlans" :key="plan.id" class="history-plan">
            <button class="history-plan__header" @click="togglePlan(plan.id)">
              <div class="history-plan__header-left">
                <span class="history-plan__badge history-plan__badge--daily">День</span>
                <span class="history-plan__date">{{ formatDate(plan.createdAt) }}</span>
                <span class="history-plan__count">{{ plan.ideas.length }} идей</span>
              </div>
              <AppIcon
                :name="expandedPlanId === plan.id ? 'chevron-up' : 'chevron-down'"
                :size="16"
              />
            </button>

            <div v-if="expandedPlanId === plan.id" class="history-plan__ideas">
              <div v-if="plan.warning" class="history-plan__warning">
                <AppIcon name="alert-circle" :size="13" color="var(--fp-warning)" />
                {{ plan.warning }}
              </div>
              <div
                v-for="(idea, i) in plan.ideas"
                :key="i"
                class="history-plan__idea"
              >
                <span v-if="isDailyIdea(idea as any)" class="history-plan__time">
                  {{ (idea as DailyPlanIdea).scheduledTime }}
                </span>
                <div class="history-plan__idea-body">
                  <span class="history-plan__idea-title">{{ (idea as DailyPlanIdea).title }}</span>
                  <p class="history-plan__idea-summary">{{ (idea as DailyPlanIdea).summary }}</p>
                </div>
                <button
                  class="history-plan__draft-btn"
                  :disabled="creatingDraftKey !== null"
                  @click="createDraftFromIdea(plan, idea as DailyPlanIdea, i)"
                >
                  <AppIcon
                    :name="creatingDraftKey === `${plan.id}-${i}` ? 'refresh' : 'draft'"
                    :size="15"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="history-page__empty">Планов на день пока нет</p>
      </template>
    </div>

    <!-- Weekly plans tab -->
    <div v-else class="history-page__content">
      <AppSkeleton v-if="loadingPlans" height="120px" />
      <template v-else>
        <div v-if="filteredWeeklyPlans.length" class="history-list stagger">
          <div v-for="plan in filteredWeeklyPlans" :key="plan.id" class="history-plan">
            <button class="history-plan__header" @click="togglePlan(plan.id)">
              <div class="history-plan__header-left">
                <span class="history-plan__badge history-plan__badge--weekly">Неделя</span>
                <span class="history-plan__date">{{ formatDate(plan.createdAt) }}</span>
                <span class="history-plan__count">{{ plan.ideas.length }} идей</span>
              </div>
              <AppIcon
                :name="expandedPlanId === plan.id ? 'chevron-up' : 'chevron-down'"
                :size="16"
              />
            </button>

            <div v-if="expandedPlanId === plan.id" class="history-plan__ideas">
              <div
                v-for="(idea, i) in plan.ideas"
                :key="i"
                class="history-plan__idea"
              >
                <span class="history-plan__time">
                  {{ String((idea as WeeklyPlanIdea).suggestedHour).padStart(2, '0') }}:00
                </span>
                <div class="history-plan__idea-body">
                  <span class="history-plan__idea-title">{{ (idea as WeeklyPlanIdea).title }}</span>
                  <p class="history-plan__idea-summary">{{ (idea as WeeklyPlanIdea).summary }}</p>
                </div>
                <button
                  class="history-plan__draft-btn"
                  :disabled="creatingDraftKey !== null"
                  @click="createDraftFromIdea(plan, idea as WeeklyPlanIdea, i)"
                >
                  <AppIcon
                    :name="creatingDraftKey === `${plan.id}-${i}` ? 'refresh' : 'draft'"
                    :size="15"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="history-page__empty">Планов на неделю пока нет</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  padding-bottom: 100px;
}

.history-page__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.history-page__back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text);
  flex-shrink: 0;
}

.history-page__header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

/* Tabs */
.history-page__tabs {
  display: flex;
  gap: 4px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  padding: 4px;
  margin-bottom: 16px;
}

.history-page__tab {
  flex: 1;
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
  text-align: center;
}

.history-page__tab--active {
  background: var(--fp-bg);
  color: var(--fp-text);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.history-page__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-page__empty {
  text-align: center;
  color: var(--fp-text-secondary);
  font-size: 14px;
  padding: 32px 0;
}

/* Posts */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-post {
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  cursor: pointer;
  transition: all var(--fp-transition);
}

.history-post:active { background: var(--fp-bg-tertiary); }

.history-post__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.history-post__date {
  font-size: 11px;
  color: var(--fp-text-tertiary);
  margin-left: auto;
}

.history-post__text {
  font-size: 13px;
  color: var(--fp-text);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Plans */
.history-plan {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  overflow: hidden;
}

.history-plan__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  color: var(--fp-text);
  gap: 8px;
}

.history-plan__header:active { background: var(--fp-bg-tertiary); }

.history-plan__header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.history-plan__badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  flex-shrink: 0;
}

.history-plan__badge--daily {
  background: rgba(59, 130, 246, 0.12);
  color: var(--fp-primary);
}

.history-plan__badge--weekly {
  background: rgba(139, 92, 246, 0.12);
  color: #8B5CF6;
}

.history-plan__date {
  font-size: 12px;
  color: var(--fp-text-secondary);
}

.history-plan__count {
  font-size: 11px;
  color: var(--fp-text-tertiary);
  margin-left: auto;
  flex-shrink: 0;
}

.history-plan__ideas {
  border-top: 1px solid var(--fp-border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-plan__warning {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--fp-text-secondary);
  padding: 6px 8px;
  background: var(--fp-warning-bg, rgba(255,170,0,0.1));
  border-radius: 6px;
}

.history-plan__idea {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: var(--fp-bg);
  border-radius: 8px;
}

.history-plan__time {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-primary);
  min-width: 38px;
  padding-top: 1px;
  flex-shrink: 0;
}

.history-plan__idea-body { flex: 1; min-width: 0; }

.history-plan__draft-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}

.history-plan__draft-btn:not(:disabled):active {
  background: var(--fp-primary);
  color: #fff;
  transform: scale(0.9);
}

.history-plan__draft-btn:disabled { opacity: 0.4; }

.history-plan__idea-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  display: block;
  margin-bottom: 2px;
}

.history-plan__idea-summary {
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.4;
}
</style>
