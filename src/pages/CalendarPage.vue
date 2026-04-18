<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/usePostsStore'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { usePlanStore } from '@/stores/usePlanStore'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/useLocaleStore'
import PostStatusBadge from '@/components/posts/PostStatusBadge.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import ChannelSwitcher from '@/components/common/ChannelSwitcher.vue'
import WeeklyPlanModal from '@/components/ai/WeeklyPlanModal.vue'
import DailyPlanModal from '@/components/ai/DailyPlanModal.vue'

const router = useRouter()
const postsStore = usePostsStore()
const schedulerStore = useSchedulerStore()
const channelsStore = useChannelsStore()
const planStore = usePlanStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { messages } = storeToRefs(localeStore)

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

const loading = ref(true)
const showWeeklyPlan = ref(false)
const showDailyPlan = ref(false)

const publishedPostsCount = computed(() => {
  const cid = channelsStore.selectedChannelId
  return postsStore.posts.filter(p =>
    (p.channelId === cid || p.channel?.id === cid) && p.status === 'published'
  ).length
})

const monthLabel = computed(() => `${messages.value.calendar.months[viewMonth.value]} ${viewYear.value}`)
const WEEKDAYS = computed(() => messages.value.calendar.weekdays)

onMounted(async () => {
  await Promise.all([
    postsStore.fetchPosts(),
    schedulerStore.fetchScheduled(),
    channelsStore.fetchChannels(),
  ])
  loading.value = false
})

interface CalendarEvent {
  id: string
  title: string
  time: string
  status: string
  type: 'post' | 'scheduled'
}

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()

  const addEvent = (dateStr: string, event: CalendarEvent) => {
    const key = dateStr.slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(event)
  }

  for (const post of postsStore.posts) {
    const date = post.publishedAt ?? post.createdAt
    const time = new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    addEvent(date, {
      id: post.id,
      title: (post.content ?? '').slice(0, 60),
      time,
      status: post.status,
      type: 'post',
    })
  }

  for (const sp of schedulerStore.scheduledPosts) {
    const time = new Date(sp.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    addEvent(sp.scheduledAt, {
      id: sp.postId,
      title: (sp.content ?? '').slice(0, 60),
      time,
      status: 'scheduled',
      type: 'scheduled',
    })
  }

  return map
})

const calendarDays = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  let startDay = first.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: Array<{ day: number; key: string; isToday: boolean } | null> = []

  for (let i = 0; i < startDay; i++) days.push(null)

  const todayKey = formatKey(now.getFullYear(), now.getMonth(), now.getDate())

  for (let d = 1; d <= lastDay; d++) {
    const key = formatKey(viewYear.value, viewMonth.value, d)
    days.push({ day: d, key, isToday: key === todayKey })
  }

  return days
})

const selectedDate = ref<string | null>(null)

const selectedEvents = computed(() => {
  if (!selectedDate.value) return []
  return eventsByDate.value.get(selectedDate.value) ?? []
})

function formatKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function prevMonth(): void {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
  selectedDate.value = null
}

function nextMonth(): void {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
  selectedDate.value = null
}

function selectDay(key: string): void {
  selectedDate.value = selectedDate.value === key ? null : key
}

function getDotsForDay(key: string): string[] {
  const events = eventsByDate.value.get(key)
  if (!events) return []
  const statuses = new Set(events.map(e => e.status))
  return Array.from(statuses).slice(0, 3)
}

function dotColor(status: string): string {
  switch (status) {
    case 'published': return 'var(--fp-success)'
    case 'scheduled': return 'var(--fp-primary)'
    case 'draft': return 'var(--fp-text-tertiary)'
    case 'failed': return 'var(--fp-error)'
    default: return 'var(--fp-text-tertiary)'
  }
}

function goToPost(id: string): void {
  router.push({ name: 'post-edit', params: { id } })
}
</script>

<template>
  <div class="calendar-page">
    <div class="calendar-page__header">
      <div class="calendar-page__header-top">
        <h1>{{ t('calendar.title') }}</h1>
        <ChannelSwitcher />
        <AppButton size="sm" @click="router.push({ name: 'post-create' })">
          <AppIcon name="plus" :size="16" />
          {{ t('calendar.post') }}
        </AppButton>
      </div>
      <div class="calendar-page__plan-btns">
        <button
          class="calendar-page__plan-btn"
          :class="{ 'calendar-page__plan-btn--locked': !planStore.hasFeature('weeklyPlan') }"
          :disabled="!channelsStore.selectedChannelId && planStore.hasFeature('weeklyPlan')"
          @click="planStore.hasFeature('weeklyPlan') ? (showDailyPlan = true) : planStore.showPaywall('LIMIT_FEATURE_WEEKLY_PLAN')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ t('calendar.planDay') }}</span>
          <span v-if="!planStore.hasFeature('weeklyPlan')" class="calendar-page__plan-lock">PRO</span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="m9 18 6-6-6-6" stroke="var(--fp-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button
          class="calendar-page__plan-btn"
          :class="{ 'calendar-page__plan-btn--locked': !planStore.hasFeature('weeklyPlan') }"
          :disabled="!channelsStore.selectedChannelId && planStore.hasFeature('weeklyPlan')"
          @click="planStore.hasFeature('weeklyPlan') ? (showWeeklyPlan = true) : planStore.showPaywall('LIMIT_FEATURE_WEEKLY_PLAN')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ t('calendar.planWeek') }}</span>
          <span v-if="!planStore.hasFeature('weeklyPlan')" class="calendar-page__plan-lock">PRO</span>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="m9 18 6-6-6-6" stroke="var(--fp-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <template v-if="loading">
      <AppSkeleton height="320px" class="mt" />
    </template>

    <template v-else>
      <!-- Calendar -->
      <div class="cal mt">
        <div class="cal__nav">
          <button class="cal__nav-btn" @click="prevMonth">
            <AppIcon name="chevron-left" :size="18" />
          </button>
          <span class="cal__month">{{ monthLabel }}</span>
          <button class="cal__nav-btn" @click="nextMonth">
            <AppIcon name="chevron-right" :size="18" />
          </button>
        </div>

        <div class="cal__weekdays">
          <span v-for="wd in WEEKDAYS" :key="wd" class="cal__wd">{{ wd }}</span>
        </div>

        <div class="cal__days">
          <template v-for="(cell, i) in calendarDays" :key="i">
            <span v-if="!cell" class="cal__day cal__day--empty" />
            <button
              v-else
              class="cal__day"
              :class="{
                'cal__day--today': cell.isToday,
                'cal__day--selected': cell.key === selectedDate,
                'cal__day--has-events': eventsByDate.has(cell.key),
              }"
              @click="selectDay(cell.key)"
            >
              <span class="cal__day-num">{{ cell.day }}</span>
              <span class="cal__dots">
                <span
                  v-for="(status, di) in getDotsForDay(cell.key)"
                  :key="di"
                  class="cal__dot"
                  :style="{ background: dotColor(status) }"
                />
              </span>
            </button>
          </template>
        </div>
      </div>

      <!-- Legend -->
      <div class="cal__legend">
        <span class="cal__legend-item">
          <span class="cal__dot" style="background: var(--fp-success)" /> {{ t('calendar.legendPublished') }}
        </span>
        <span class="cal__legend-item">
          <span class="cal__dot" style="background: var(--fp-primary)" /> {{ t('calendar.legendScheduled') }}
        </span>
        <span class="cal__legend-item">
          <span class="cal__dot" style="background: var(--fp-text-tertiary)" /> {{ t('calendar.legendDraft') }}
        </span>
      </div>

      <!-- Selected day events -->
      <div v-if="selectedDate" class="cal__events mt">
        <h3 class="cal__events-title">
          {{ selectedDate.split('-').reverse().join('.') }}
        </h3>

        <div v-if="selectedEvents.length" class="cal__events-list stagger">
          <div
            v-for="event in selectedEvents"
            :key="event.id"
            class="cal__event pressable"
            @click="goToPost(event.id)"
          >
            <div class="cal__event-left">
              <span class="cal__event-time">{{ event.time }}</span>
              <span class="cal__event-bar" :style="{ background: dotColor(event.status) }" />
            </div>
            <div class="cal__event-body">
              <PostStatusBadge :status="event.status as any" />
              <p class="cal__event-text">{{ event.title }}</p>
            </div>
          </div>
        </div>

        <p v-else class="cal__no-events">{{ t('calendar.noEventsDay') }}</p>
      </div>
    </template>

    <DailyPlanModal
      v-if="showDailyPlan && channelsStore.selectedChannelId"
      :channel-id="channelsStore.selectedChannelId"
      :published-posts-count="publishedPostsCount"
      @close="showDailyPlan = false"
    />

    <WeeklyPlanModal
      v-if="showWeeklyPlan && channelsStore.selectedChannelId"
      :channel-id="channelsStore.selectedChannelId"
      @close="showWeeklyPlan = false"
    />
  </div>
</template>

<style scoped>
.calendar-page__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calendar-page__header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-page__header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.calendar-page__plan-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-page__plan-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  background: var(--fp-primary-bg);
  border-radius: var(--fp-radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-primary);
  transition: all var(--fp-transition);
}

.calendar-page__plan-btn span {
  flex: 1;
  text-align: left;
}

.calendar-page__plan-btn:active:not(:disabled) { opacity: 0.7; transform: scale(0.99); }
.calendar-page__plan-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.calendar-page__plan-btn--locked {
  background: var(--fp-bg-secondary);
  border-color: var(--fp-border);
  color: var(--fp-text-secondary);
}

.calendar-page__plan-lock {
  font-size: 10px;
  font-weight: 800;
  background: rgba(245,158,11,0.15);
  color: #D97706;
  padding: 2px 6px;
  border-radius: 5px;
  margin-left: auto;
}

/* Calendar */
.cal {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
}

.cal__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.cal__nav-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--fp-bg);
  color: var(--fp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fp-transition);
}

.cal__nav-btn:active {
  transform: scale(0.9);
}

.cal__month {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
}

.cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.cal__wd {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  padding: 4px 0;
  text-transform: uppercase;
}

.cal__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 2px 4px;
  border-radius: 10px;
  min-height: 42px;
  background: none;
  color: var(--fp-text);
  transition: all var(--fp-transition);
}

.cal__day--empty {
  pointer-events: none;
}

.cal__day-num {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
}

.cal__day--today .cal__day-num {
  font-weight: 800;
}

.cal__day--today:not(.cal__day--selected) {
  background: var(--fp-bg);
}

.cal__day--selected {
  background: var(--fp-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.cal__day--selected .cal__dot {
  background: rgba(255, 255, 255, 0.8) !important;
}

.cal__day:not(.cal__day--empty):active {
  transform: scale(0.92);
}

/* Dots */
.cal__dots {
  display: flex;
  gap: 3px;
  margin-top: 3px;
  min-height: 5px;
}

.cal__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Legend */
.cal__legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
}

.cal__legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--fp-text-secondary);
}

/* Events list */
.cal__events {
  animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cal__events-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 12px;
}

.cal__events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cal__event {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: all var(--fp-transition);
}

.cal__event:active {
  background: var(--fp-bg-tertiary);
}

.cal__event-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 44px;
}

.cal__event-time {
  font-size: 13px;
  font-weight: 700;
  color: var(--fp-text);
}

.cal__event-bar {
  width: 3px;
  flex: 1;
  border-radius: 2px;
  min-height: 16px;
}

.cal__event-body {
  flex: 1;
  min-width: 0;
}

.cal__event-text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--fp-text);
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cal__no-events {
  text-align: center;
  color: var(--fp-text-secondary);
  font-size: 14px;
  padding: 16px 0;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
