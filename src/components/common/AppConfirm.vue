<script setup lang="ts">
defineProps<{
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function onOverlayClick(e: MouseEvent): void {
  if (e.target === e.currentTarget) emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click="onOverlayClick">
      <div class="confirm">
        <p class="confirm__message">{{ message }}</p>
        <div class="confirm__actions">
          <button class="confirm__btn confirm__btn--cancel" @click="$emit('cancel')">
            {{ cancelLabel ?? 'Отмена' }}
          </button>
          <button
            class="confirm__btn"
            :class="danger ? 'confirm__btn--danger' : 'confirm__btn--primary'"
            @click="$emit('confirm')"
          >
            {{ confirmLabel ?? 'Подтвердить' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9500;
  padding: var(--fp-spacing);
  animation: fadeIn 0.15s ease;
}

.confirm {
  background: var(--fp-bg);
  border-radius: var(--fp-radius);
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 340px;
  animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm__message {
  font-size: 15px;
  line-height: 1.5;
  color: var(--fp-text);
  margin-bottom: 20px;
  text-align: center;
}

.confirm__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.confirm__btn {
  padding: 12px;
  border-radius: var(--fp-radius-sm);
  font-size: 15px;
  font-weight: 600;
  transition: all var(--fp-transition);
}

.confirm__btn:active {
  transform: scale(0.96);
}

.confirm__btn--cancel {
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
}

.confirm__btn--primary {
  background: var(--fp-primary);
  color: #fff;
}

.confirm__btn--danger {
  background: var(--fp-error-bg);
  color: var(--fp-error);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
