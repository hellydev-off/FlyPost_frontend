<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'home', path: '/', icon: '&#x1F3E0;', label: 'Главная' },
  { name: 'channels', path: '/channels', icon: '&#x1F4E2;', label: 'Каналы' },
  { name: 'post-create', path: '/posts/create', icon: '&#x2795;', label: 'Создать' },
  { name: 'scheduler', path: '/scheduler', icon: '&#x1F4C5;', label: 'Планер' },
  { name: 'analytics', path: '/analytics', icon: '&#x1F4CA;', label: 'Статистика' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.path"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.name === tab.name }"
    >
      <span class="bottom-nav__icon" v-html="tab.icon" />
      <span class="bottom-nav__label">{{ tab.label }}</span>
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
  height: var(--fp-bottom-nav-height);
  background: var(--tg-theme-bg-color);
  border-top: 1px solid var(--tg-theme-secondary-bg-color);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  color: var(--tg-theme-hint-color);
  text-decoration: none;
  transition: color var(--fp-transition);
  flex: 1;
}

.bottom-nav__item--active {
  color: var(--tg-theme-button-color);
}

.bottom-nav__icon {
  font-size: 20px;
  line-height: 1;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
}
</style>
