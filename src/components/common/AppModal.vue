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
        <div class="modal__header">
          <h3 class="modal__title">{{ title }}</h3>
          <button class="modal__close" @click="$emit('close')">&#x2715;</button>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal {
  background: var(--tg-theme-bg-color);
  border-radius: var(--fp-radius) var(--fp-radius) 0 0;
  width: 100%;
  max-width: var(--fp-max-width);
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fp-spacing);
  border-bottom: 1px solid var(--tg-theme-secondary-bg-color);
  position: sticky;
  top: 0;
  background: var(--tg-theme-bg-color);
}

.modal__title {
  font-size: 17px;
  font-weight: 600;
}

.modal__close {
  font-size: 18px;
  color: var(--tg-theme-hint-color);
  padding: 4px;
}

.modal__body {
  padding: var(--fp-spacing);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
