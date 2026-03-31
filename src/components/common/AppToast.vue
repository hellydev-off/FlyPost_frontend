<script setup lang="ts">
import { useToastStore } from '@/stores/useToastStore'
import AppIcon from './AppIcon.vue'

const toast = useToastStore()

function iconName(type: string): string {
  switch (type) {
    case 'success': return 'check-circle'
    case 'error': return 'x-circle'
    case 'info': return 'info-circle'
    default: return 'info-circle'
  }
}
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
        <AppIcon :name="iconName(item.type)" :size="18" />
        <span class="toast__text">{{ item.message }}</span>
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--fp-radius);
  font-size: 14px;
  font-weight: 500;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: var(--fp-shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.toast--success {
  background: var(--fp-success-bg);
  color: var(--fp-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.toast--error {
  background: var(--fp-error-bg);
  color: var(--fp-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.toast--info {
  background: var(--fp-info-bg);
  color: var(--fp-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.toast__text {
  flex: 1;
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
