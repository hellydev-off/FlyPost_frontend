<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>()
</script>

<template>
  <button
    class="app-button"
    :class="[
      `app-button--${variant ?? 'primary'}`,
      `app-button--${size ?? 'md'}`,
      { 'app-button--block': block, 'app-button--loading': loading },
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="app-button__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--fp-radius);
  font-weight: 600;
  transition: all var(--fp-transition);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.app-button:active:not(:disabled) {
  transform: scale(0.97);
}

.app-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.app-button--md {
  padding: 13px 22px;
  font-size: 15px;
}

.app-button--sm {
  padding: 8px 14px;
  font-size: 13px;
  border-radius: var(--fp-radius-sm);
}

.app-button--primary {
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.app-button--primary:active:not(:disabled) {
  box-shadow: 0 1px 4px rgba(59, 130, 246, 0.2);
}

.app-button--secondary {
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
}

.app-button--danger {
  background: var(--fp-error-bg);
  color: var(--fp-error);
}

.app-button--ghost {
  background: transparent;
  color: var(--fp-primary);
}

.app-button--block {
  width: 100%;
}

.app-button--loading {
  pointer-events: none;
}

.app-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
