<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  description: string
}>()

const router = useRouter()
</script>

<template>
  <div class="feature-lock">
    <div class="feature-lock__icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" fill="var(--fp-primary)" fill-opacity="0.15" stroke="var(--fp-primary)" stroke-width="1.5"/>
        <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="var(--fp-primary)" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill="var(--fp-primary)"/>
      </svg>
    </div>
    <div class="feature-lock__text">
      <h3 class="feature-lock__title">{{ title }}</h3>
      <p class="feature-lock__desc">{{ description }}</p>
    </div>
    <button class="feature-lock__btn" @click="router.push({ name: 'pricing' })">
      Улучшить
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.feature-lock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border: 1.5px solid var(--fp-border);
}

.feature-lock__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--fp-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-lock__text {
  flex: 1;
  min-width: 0;
}

.feature-lock__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 2px;
}

.feature-lock__desc {
  font-size: 12px;
  color: var(--fp-text-tertiary);
  line-height: 1.4;
}

.feature-lock__btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--fp-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  transition: opacity var(--fp-transition);
}

.feature-lock__btn:active { opacity: 0.8; }
</style>
