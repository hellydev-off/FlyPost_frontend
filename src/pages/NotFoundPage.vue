<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocaleStore } from '@/stores/useLocaleStore'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const { t } = useLocaleStore()
</script>

<template>
  <div class="not-found">
    <AppIcon name="alert-circle" :size="56" color="var(--fp-text-tertiary)" />
    <h1 class="not-found__title">{{ t('notFound.title') }}</h1>
    <p class="not-found__desc">{{ t('notFound.desc') }}</p>
    <AppButton @click="router.replace({ name: 'home' })">
      <AppIcon name="home" :size="18" />
      {{ t('notFound.btn') }}
    </AppButton>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  text-align: center;
  padding: var(--fp-spacing-lg);
}

.not-found__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--fp-text);
}

.not-found__desc {
  font-size: 15px;
  color: var(--fp-text-secondary);
  margin-bottom: 4px;
}
</style>
