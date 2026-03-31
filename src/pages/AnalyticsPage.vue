<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { analyticsApi } from '@/api/analytics.api'
import type { ChannelStats, SubscriberHistory, SubscriberPoint } from '@/types/analytics.types'
import StatsCard from '@/components/analytics/StatsCard.vue'
import PostsChart from '@/components/analytics/PostsChart.vue'
import PostCard from '@/components/posts/PostCard.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import HealthScoreCard from '@/components/analytics/HealthScoreCard.vue'
import BestTimeCard from '@/components/analytics/BestTimeCard.vue'
import ShareReportModal from '@/components/analytics/ShareReportModal.vue'
import { useRouter } from 'vue-router'
import type { HealthScoreData, BestTimeData } from '@/types/analytics.types'
import type { ShareReportData } from '@/composables/useShareReport'

const router = useRouter()
const channelsStore = useChannelsStore()
const stats = ref<ChannelStats | null>(null)
const subHistory = ref<SubscriberHistory | null>(null)
const healthScore = ref<HealthScoreData | null>(null)
const bestTime = ref<BestTimeData | null>(null)
const loading = ref(true)
const selectedId = ref('')
const showShareReport = ref(false)

const shareReportData = computed<ShareReportData | null>(() => {
  if (!stats.value) return null
  const ch = channelsStore.channels.find(c => c.id === selectedId.value)
  return {
    channelTitle: ch?.title ?? '',
    channelUsername: ch?.username ?? '',
    subscriberCount: subHistory.value?.current ?? null,
    growth7d: subHistory.value?.growth7d ?? null,
    published: stats.value.published,
    healthScore: healthScore.value?.score ?? null,
  }
})

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
    const [s, h, hs, bt] = await Promise.all([
      analyticsApi.getStats(id),
      analyticsApi.getSubscriberHistory(id),
      analyticsApi.getHealthScore(id),
      analyticsApi.getBestTime(id),
    ])
    stats.value = s
    subHistory.value = h
    healthScore.value = hs
    bestTime.value = bt
  } finally {
    loading.value = false
  }
}, { immediate: true })

// SVG line chart для истории подписчиков
const chartWidth = 320
const chartHeight = 80

const svgPath = computed(() => {
  const pts = subHistory.value?.history
  if (!pts || pts.length < 2) return ''
  const counts = pts.map(p => p.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const range = max - min || 1
  const step = chartWidth / (pts.length - 1)
  const points = pts.map((p, i) => {
    const x = i * step
    const y = chartHeight - ((p.count - min) / range) * (chartHeight - 8) - 4
    return `${x},${y}`
  })
  return 'M' + points.join(' L')
})

const svgArea = computed(() => {
  const pts = subHistory.value?.history
  if (!pts || pts.length < 2) return ''
  const counts = pts.map(p => p.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const range = max - min || 1
  const step = chartWidth / (pts.length - 1)
  const points = pts.map((p, i) => {
    const x = i * step
    const y = chartHeight - ((p.count - min) / range) * (chartHeight - 8) - 4
    return `${x},${y}`
  })
  const last = (pts.length - 1) * step
  return `M0,${chartHeight} ` + points.map((pt, i) => (i === 0 ? `L${pt}` : `L${pt}`)).join(' ') + ` L${last},${chartHeight} Z`
})

function formatGrowth(val: number | null): string {
  if (val === null) return '—'
  return (val >= 0 ? '+' : '') + val
}

function formatCount(val: number | null): string {
  if (val === null) return '—'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return String(val)
}

// Метки дат для оси X
const dateLabels = computed(() => {
  const pts = subHistory.value?.history
  if (!pts || pts.length < 2) return []
  const step = Math.floor(pts.length / 3)
  return [0, step, step * 2, pts.length - 1].map(i => {
    const d = new Date(pts[Math.min(i, pts.length - 1)].recordedAt)
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
  })
})
</script>

<template>
  <div class="analytics-page">
    <h1>Аналитика</h1>

    <div class="analytics-page__channel mt">
      <div class="analytics-page__select-wrap">
        <AppIcon name="chart" :size="18" color="var(--fp-primary)" />
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
        <AppIcon name="chevron-down" :size="16" color="var(--fp-text-tertiary)" />
      </div>
    </div>

    <AppLoader v-if="loading" />

    <template v-else-if="stats">
      <div class="analytics-page__stats mt stagger">
        <StatsCard label="Всего" :value="stats.total" />
        <StatsCard label="Опубликовано" :value="stats.published" color="var(--fp-success)" />
        <StatsCard label="Запланировано" :value="stats.scheduled" color="var(--fp-primary)" />
        <StatsCard label="Черновики" :value="stats.drafts" />
      </div>

      <div class="mt">
        <PostsChart
          :published="stats.published"
          :scheduled="stats.scheduled"
          :drafts="stats.drafts"
        />
      </div>

      <HealthScoreCard v-if="healthScore" :data="healthScore" class="mt" />
      <BestTimeCard v-if="bestTime" :data="bestTime" class="mt" />

      <button
        v-if="shareReportData"
        class="analytics-page__share-btn mt"
        @click="showShareReport = true"
      >
        <AppIcon name="share" :size="18" color="var(--fp-primary)" />
        <span>Поделиться отчётом</span>
      </button>

      <button class="analytics-page__competitors-btn mt" @click="router.push({ name: 'competitors' })">
        <AppIcon name="chart" :size="18" color="var(--fp-primary)" />
        <span>Анализ конкурентов</span>
        <AppIcon name="chevron-right" :size="16" color="var(--fp-text-tertiary)" />
      </button>

      <!-- Subscriber growth -->
      <div v-if="subHistory" class="sub-card mt">
        <div class="sub-card__header">
          <div class="sub-card__title-row">
            <AppIcon name="user" :size="18" color="var(--fp-primary)" />
            <span class="sub-card__title">Подписчики</span>
          </div>
          <span class="sub-card__current">{{ formatCount(subHistory.current) }}</span>
        </div>

        <div class="sub-card__growth-row">
          <div class="sub-card__growth-item">
            <span
              class="sub-card__growth-value"
              :class="subHistory.growth7d !== null && subHistory.growth7d >= 0 ? 'sub-card__growth-value--pos' : 'sub-card__growth-value--neg'"
            >{{ formatGrowth(subHistory.growth7d) }}</span>
            <span class="sub-card__growth-label">за 7 дней</span>
          </div>
          <div class="sub-card__growth-item">
            <span
              class="sub-card__growth-value"
              :class="subHistory.growth30d !== null && subHistory.growth30d >= 0 ? 'sub-card__growth-value--pos' : 'sub-card__growth-value--neg'"
            >{{ formatGrowth(subHistory.growth30d) }}</span>
            <span class="sub-card__growth-label">за 30 дней</span>
          </div>
        </div>

        <div v-if="subHistory.history.length >= 2" class="sub-card__chart">
          <svg
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            preserveAspectRatio="none"
            class="sub-card__svg"
          >
            <defs>
              <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--fp-primary)" stop-opacity="0.2" />
                <stop offset="100%" stop-color="var(--fp-primary)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="svgArea" fill="url(#subGradient)" />
            <path :d="svgPath" fill="none" stroke="var(--fp-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="sub-card__dates">
            <span v-for="label in dateLabels" :key="label">{{ label }}</span>
          </div>
        </div>

        <div v-else class="sub-card__empty">
          <AppIcon name="clock" :size="20" color="var(--fp-text-tertiary)" />
          <span>Данные собираются каждый час. Зайдите позже.</span>
        </div>
      </div>

      <div v-if="stats.lastPosts.length" class="mt">
        <h2 class="analytics-page__subtitle">Последние посты</h2>
        <div class="analytics-page__posts stagger">
          <PostCard
            v-for="post in stats.lastPosts"
            :key="post.id"
            :post="post"
            @click="router.push({ name: 'post-edit', params: { id: $event } })"
          />
        </div>
      </div>
    </template>

    <ShareReportModal
      v-if="showShareReport && shareReportData"
      :data="shareReportData"
      @close="showShareReport = false"
    />
  </div>
</template>

<style scoped>
.analytics-page h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.analytics-page__select-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.analytics-page__select-wrap:focus-within {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
}

.analytics-page__select {
  flex: 1;
  background: transparent;
  font-size: 15px;
  appearance: none;
  color: var(--fp-text);
}

.analytics-page__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fp-spacing-sm);
}

.analytics-page__subtitle {
  font-size: 17px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: var(--fp-spacing-sm);
}

.analytics-page__posts {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.analytics-page__share-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: var(--fp-primary-bg);
  border-radius: var(--fp-radius);
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-primary);
  transition: all var(--fp-transition);
}

.analytics-page__share-btn span { flex: 1; text-align: left; }
.analytics-page__share-btn:active { opacity: 0.7; }

.analytics-page__competitors-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
  transition: all var(--fp-transition);
}

.analytics-page__competitors-btn span { flex: 1; text-align: left; }
.analytics-page__competitors-btn:active { opacity: 0.7; }

/* Subscriber card */
.sub-card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
}

.sub-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sub-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
}

.sub-card__current {
  font-size: 22px;
  font-weight: 800;
  color: var(--fp-primary);
}

.sub-card__growth-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.sub-card__growth-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-card__growth-value {
  font-size: 16px;
  font-weight: 700;
}

.sub-card__growth-value--pos {
  color: var(--fp-success);
}

.sub-card__growth-value--neg {
  color: var(--fp-error);
}

.sub-card__growth-label {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.sub-card__chart {
  position: relative;
}

.sub-card__svg {
  width: 100%;
  height: 80px;
  display: block;
}

.sub-card__dates {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: var(--fp-text-tertiary);
}

.sub-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
  font-size: 13px;
  color: var(--fp-text-tertiary);
}
</style>
