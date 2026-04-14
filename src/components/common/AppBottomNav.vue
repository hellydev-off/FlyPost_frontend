<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

const route = useRoute()
const router = useRouter()
const locale = useLocaleStore()

const showMoreSheet = ref(false)

const tabs = computed(() => [
  { name: 'home', path: '/', icon: 'home', iconActive: 'home-filled', label: locale.t('nav.home') },
  { name: 'channels', path: '/channels', icon: 'channels', iconActive: 'channels-filled', label: locale.t('nav.channels') },
  { name: 'post-create', path: '/posts/create', icon: 'plus', iconActive: 'plus', label: '' },
  { name: 'calendar', path: '/calendar', icon: 'calendar', iconActive: 'calendar-filled', label: locale.t('nav.calendar') },
])

function isActive(tabName: string): boolean {
  return route.name === tabName
}

const MORE_ROUTES = new Set(['analytics', 'history', 'templates', 'profile', 'streak', 'scheduler', 'pricing', 'competitors'])

const isMoreActive = computed(() =>
  typeof route.name === 'string' && MORE_ROUTES.has(route.name),
)

function navigate(path: string): void {
  showMoreSheet.value = false
  router.push(path)
}
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      class="bottom-nav__item"
      :class="{
        'bottom-nav__item--active': isActive(tab.name),
        'bottom-nav__item--create': tab.name === 'post-create',
      }"
    >
      <template v-if="tab.name === 'post-create'">
        <span class="bottom-nav__create-btn">
          <AppIcon name="plus" :size="28" color="#fff" />
        </span>
      </template>
      <template v-else>
        <AppIcon
          :name="isActive(tab.name) ? tab.iconActive : tab.icon"
          :size="22"
        />
        <span class="bottom-nav__label">{{ tab.label }}</span>
      </template>
    </RouterLink>

    <!-- Кнопка Ещё -->
    <button
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isMoreActive || showMoreSheet }"
      @click="showMoreSheet = true"
    >
      <AppIcon name="grid" :size="22" />
      <span class="bottom-nav__label">{{ locale.t('nav.more') }}</span>
    </button>
  </nav>

  <!-- Overlay -->
  <Teleport to="body">
    <Transition name="sheet-fade">
      <div v-if="showMoreSheet" class="more-overlay" @click="showMoreSheet = false" />
    </Transition>

    <Transition name="sheet-slide">
      <div v-if="showMoreSheet" class="more-sheet">
        <div class="more-sheet__handle" />

        <p class="more-sheet__section-title">{{ locale.t('nav.sections') }}</p>

        <button class="more-sheet__item" @click="navigate('/analytics')">
          <span class="more-sheet__item-icon">
            <AppIcon name="chart" :size="20" />
          </span>
          <div class="more-sheet__item-body">
            <span class="more-sheet__item-label">{{ locale.t('nav.analytics') }}</span>
            <span class="more-sheet__item-desc">{{ locale.t('nav.analyticsDesc') }}</span>
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </button>

        <p class="more-sheet__section-title">{{ locale.t('nav.history') }}</p>

        <button class="more-sheet__item" @click="navigate('/history')">
          <span class="more-sheet__item-icon more-sheet__item-icon--posts">
            <AppIcon name="draft" :size="20" />
          </span>
          <div class="more-sheet__item-body">
            <span class="more-sheet__item-label">{{ locale.t('nav.postHistory') }}</span>
            <span class="more-sheet__item-desc">{{ locale.t('nav.postHistoryDesc') }}</span>
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </button>

        <button class="more-sheet__item" @click="navigate('/history?tab=daily')">
          <span class="more-sheet__item-icon more-sheet__item-icon--daily">
            <AppIcon name="clock" :size="20" />
          </span>
          <div class="more-sheet__item-body">
            <span class="more-sheet__item-label">{{ locale.t('nav.dailyPlans') }}</span>
            <span class="more-sheet__item-desc">{{ locale.t('nav.dailyPlansDesc') }}</span>
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </button>

        <button class="more-sheet__item" @click="navigate('/history?tab=weekly')">
          <span class="more-sheet__item-icon more-sheet__item-icon--weekly">
            <AppIcon name="calendar" :size="20" />
          </span>
          <div class="more-sheet__item-body">
            <span class="more-sheet__item-label">{{ locale.t('nav.weeklyPlans') }}</span>
            <span class="more-sheet__item-desc">{{ locale.t('nav.weeklyPlansDesc') }}</span>
          </div>
          <AppIcon name="chevron-right" :size="16" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: var(--fp-tg-bottom-inset);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  height: var(--fp-bottom-nav-height);
  background: var(--fp-bg);
  border-top: 1px solid var(--fp-border);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding-top: 10px;
  z-index: 100;
}


.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 0 4px;
  color: var(--fp-text-tertiary);
  text-decoration: none;
  transition: color var(--fp-transition);
  flex: 1;
  position: relative;
  min-height: 44px;
  background: none;
}

.bottom-nav__item--active {
  color: var(--fp-primary);
}

.bottom-nav__item--create {
  color: var(--fp-text-tertiary);
}

.bottom-nav__create-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -20px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  transition: transform var(--fp-transition), box-shadow var(--fp-transition);
}

.bottom-nav__item--create:active .bottom-nav__create-btn {
  transform: scale(0.92);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

.bottom-nav__item:not(.bottom-nav__item--create):active {
  transform: scale(0.92);
}

/* Overlay */
.more-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
}

/* Sheet */
.more-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  padding: 12px 16px calc(max(env(safe-area-inset-bottom), 16px) + 16px);
  z-index: 201;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.more-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.more-sheet__section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 4px;
  margin-top: 8px;
  margin-bottom: 4px;
}

.more-sheet__section-title:first-of-type {
  margin-top: 0;
}

.more-sheet__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--fp-radius-sm);
  color: var(--fp-text);
  transition: background var(--fp-transition);
  width: 100%;
  text-align: left;
}

.more-sheet__item:active {
  background: var(--fp-bg-secondary);
}

.more-sheet__item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--fp-text-secondary);
}

.more-sheet__item-icon--posts { background: rgba(59,130,246,0.1); color: var(--fp-primary); }
.more-sheet__item-icon--daily { background: rgba(16,185,129,0.1); color: #10B981; }
.more-sheet__item-icon--weekly { background: rgba(139,92,246,0.1); color: #8B5CF6; }

.more-sheet__item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.more-sheet__item-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
}

.more-sheet__item-desc {
  font-size: 12px;
  color: var(--fp-text-secondary);
}

/* Transitions */
.sheet-fade-enter-active,
.sheet-fade-leave-active { transition: opacity 0.25s ease; }
.sheet-fade-enter-from,
.sheet-fade-leave-to { opacity: 0; }

.sheet-slide-enter-active,
.sheet-slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-slide-enter-from,
.sheet-slide-leave-to { transform: translateX(-50%) translateY(100%); }
</style>
