<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { getTelegramWebApp } from '@/utils/telegram'
import AppBottomNav from '@/components/common/AppBottomNav.vue'
import AppToast from '@/components/common/AppToast.vue'

const auth = useAuthStore()

onMounted(async () => {
  const tg = getTelegramWebApp()
  tg?.ready()
  tg?.expand()
  await auth.initFromTelegram()
})
</script>

<template>
  <div v-if="auth.isLoading" class="app-loader">
    <div class="app-loader__spinner" />
  </div>

  <template v-else>
    <AppToast />
    <router-view v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <AppBottomNav />
  </template>
</template>

<style>
@import '@/styles/global.css';

.app-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  background: var(--tg-theme-bg-color, #ffffff);
}

.app-loader__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--tg-theme-hint-color, #cccccc);
  border-top-color: var(--tg-theme-button-color, #2481cc);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
