<script setup lang="ts">
import { useToastStore } from '@/stores/useToastStore'

const toast = useToastStore()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="item in toast.toasts"
        :key="item.id"
        class="toast"
        :class="`toast--${item.type}`"
        @click="toast.remove(item.id)"
      >
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: var(--fp-max-width);
  pointer-events: none;
}

.toast {
  padding: 12px 16px;
  border-radius: var(--fp-radius);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  pointer-events: auto;
  cursor: pointer;
}

.toast--success {
  background: var(--fp-success);
  color: #fff;
}

.toast--error {
  background: var(--fp-error);
  color: #fff;
}

.toast--info {
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
