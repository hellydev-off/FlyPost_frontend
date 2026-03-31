<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import AppBottomNav from '@/components/common/AppBottomNav.vue'
import AppToast from '@/components/common/AppToast.vue'
import AchievementToast from '@/components/common/AchievementToast.vue'

const auth = useAuthStore()
const route = useRoute()

const showNav = computed(() => auth.isAuthenticated && !route.meta.guest)
</script>

<template>
  <AppToast />
  <AchievementToast />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
  <AppBottomNav v-if="showNav" />
</template>

<style>
@import '@/styles/global.css';
</style>
