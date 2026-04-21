<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()
const checking = ref(false)

async function recheck(): Promise<void> {
  checking.value = true
  await auth.checkSubscription()
  checking.value = false
}
</script>

<template>
  <div class="sub-gate">
    <div class="sub-gate__icon">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <h1 class="sub-gate__title">Подпишись на канал</h1>
    <p class="sub-gate__desc">
      Чтобы использовать NeoPost, нужно быть подписчиком нашего Telegram-канала.
      Там мы публикуем обновления, советы и новые функции.
    </p>

    <a
      href="https://t.me/neopostchannel"
      target="_blank"
      rel="noopener"
      class="sub-gate__btn sub-gate__btn--primary"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Подписаться на @neopostchannel
    </a>

    <button
      class="sub-gate__btn sub-gate__btn--secondary"
      :disabled="checking"
      @click="recheck"
    >
      <span v-if="checking" class="sub-gate__spinner" />
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Я подписался — проверить
    </button>
  </div>
</template>

<style scoped>
.sub-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 32px 24px;
  text-align: center;
  gap: 16px;
}

.sub-gate__icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.sub-gate__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--fp-text);
}

.sub-gate__desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--fp-text-secondary);
  max-width: 300px;
}

.sub-gate__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  padding: 15px 20px;
  border-radius: var(--fp-radius);
  font-size: 15px;
  font-weight: 600;
  transition: all var(--fp-transition);
  text-decoration: none;
  cursor: pointer;
}

.sub-gate__btn--primary {
  background: var(--fp-primary);
  color: #fff;
}

.sub-gate__btn--primary:active {
  opacity: 0.85;
}

.sub-gate__btn--secondary {
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  border: 1.5px solid var(--fp-border);
}

.sub-gate__btn--secondary:active:not(:disabled) {
  opacity: 0.7;
}

.sub-gate__btn--secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sub-gate__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--fp-border);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
