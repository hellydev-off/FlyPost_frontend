<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AppBottomNav from '@/components/common/AppBottomNav.vue'
import AppToast from '@/components/common/AppToast.vue'
import AchievementToast from '@/components/common/AchievementToast.vue'
import PaywallModal from '@/components/common/PaywallModal.vue'
import { usePlanStore } from '@/stores/usePlanStore'

const auth = useAuthStore()
const route = useRoute()
const planStore = usePlanStore()

const showNav = computed(() => auth.isAuthenticated && !route.meta.guest)

// Sync guest class on #app element for CSS to remove nav padding
watchEffect(() => {
  document.getElementById('app')?.classList.toggle('app--guest', !!route.meta.guest)
})

// Load subscription status when authenticated
watchEffect(() => {
  if (auth.isAuthenticated) planStore.fetchStatus()
})
</script>

<template>
  <AppToast />
  <AchievementToast />
  <PaywallModal />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
  <div v-if="showNav" class="nav-floor" />
  <AppBottomNav v-if="showNav" />
</template>

<style>
@import '@/styles/global.css';

#app.app--guest {
  padding-top: var(--fp-spacing);
  padding-bottom: var(--fp-spacing);
}

/* Непрозрачная подложка под навбаром — перекрывает контент при скролле */
.nav-floor {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  height: calc(var(--fp-bottom-nav-height) + var(--fp-tg-bottom-inset) + env(safe-area-inset-bottom, 0px));
  background: var(--fp-bg);
  z-index: 99;
  pointer-events: none;
}
</style>
