<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

function onOverlayClick(e: MouseEvent): void {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="onOverlayClick">
      <div class="modal">
        <div class="modal__pill" />
        <div class="modal__header">
          <h3 class="modal__title">{{ title }}</h3>
          <button class="modal__close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div class="modal__body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: var(--fp-max-width);
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUpBounce 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal__pill {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--fp-bg-tertiary);
  margin: 8px auto 0;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--fp-spacing) 12px;
  position: sticky;
  top: 0;
  background: var(--fp-bg);
  z-index: 1;
}

.modal__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fp-text);
}

.modal__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
}

.modal__close:active {
  transform: scale(0.9);
  background: var(--fp-bg-tertiary);
}

.modal__body {
  padding: 4px var(--fp-spacing) calc(var(--fp-spacing) + env(safe-area-inset-bottom));
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUpBounce {
  0% { transform: translateY(100%); }
  70% { transform: translateY(-2%); }
  100% { transform: translateY(0); }
}
</style>
