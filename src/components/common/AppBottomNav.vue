<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const route = useRoute()

const tabs = [
  { name: 'home', path: '/', icon: 'home', iconActive: 'home-filled', label: 'Главная' },
  { name: 'channels', path: '/channels', icon: 'channels', iconActive: 'channels-filled', label: 'Каналы' },
  { name: 'post-create', path: '/posts/create', icon: 'plus', iconActive: 'plus', label: '' },
  { name: 'calendar', path: '/calendar', icon: 'calendar', iconActive: 'calendar-filled', label: 'Календарь' },
  { name: 'analytics', path: '/analytics', icon: 'chart', iconActive: 'chart-filled', label: 'Аналитика' },
]

function isActive(tabName: string): boolean {
  return route.name === tabName
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
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  height: calc(var(--fp-bottom-nav-height) + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--fp-bg) 85%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--fp-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding-top: 8px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 0;
  color: var(--fp-text-tertiary);
  text-decoration: none;
  transition: color var(--fp-transition);
  flex: 1;
  position: relative;
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
</style>
