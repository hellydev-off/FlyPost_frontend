<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Channel } from '@/types/channel.types'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

const props = defineProps<{
  channels: Channel[]
  currentChannelId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [channelIds: string[]]
}>()

const { t } = useLocaleStore()
const selected = ref<Set<string>>(new Set())

const available = computed(() =>
  props.channels.filter(c => c.id !== props.currentChannelId)
)

function toggle(id: string): void {
  if (selected.value.has(id)) {
    selected.value.delete(id)
  } else {
    selected.value.add(id)
  }
}

function confirm(): void {
  if (!selected.value.size) return
  emit('confirm', [...selected.value])
}
</script>

<template>
  <Transition name="overlay">
  <div class="modal-overlay" @click.self="emit('close')">
    <Transition name="sheet">
    <div class="modal">
      <div class="modal__header">
        <h2>{{ t('crossPost.title') }}</h2>
        <button class="modal__close" @click="emit('close')">
          <AppIcon name="close" :size="20" />
        </button>
      </div>

      <p class="modal__desc">{{ t('crossPost.subtitle') }}</p>

      <div class="modal__list">
        <div
          v-for="ch in available"
          :key="ch.id"
          class="modal__item"
          :class="{ 'modal__item--selected': selected.has(ch.id) }"
          @click="toggle(ch.id)"
        >
          <div class="modal__item-icon">
            <AppIcon name="channels" :size="18" color="var(--fp-primary)" />
          </div>
          <span class="modal__item-title">{{ ch.title }}</span>
          <div class="modal__item-check">
            <AppIcon v-if="selected.has(ch.id)" name="check" :size="16" color="var(--fp-primary)" />
          </div>
        </div>

        <div v-if="!available.length" class="modal__empty">
          <p>{{ t('crossPost.noChannels') }}</p>
        </div>
      </div>

      <div class="modal__actions">
        <AppButton block variant="secondary" @click="emit('close')">{{ t('crossPost.cancel') }}</AppButton>
        <AppButton
          block
          :loading="loading"
          :disabled="!selected.size"
          @click="confirm"
        >
          <AppIcon name="share" :size="18" />
          {{ t('crossPost.publishBtn') }} ({{ selected.size }})
        </AppButton>
      </div>
    </div>
    </Transition>
  </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 300;
  padding: 0;
}

.modal {
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80vh;
}

/* Overlay fade */
.overlay-enter-active,
.overlay-leave-active {
  transition: background 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  background: rgba(0, 0, 0, 0);
}

/* Sheet slide up */
.sheet-enter-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-leave-active {
  transition: transform 0.2s ease-in;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal__header h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--fp-text);
}

.modal__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__desc {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin-top: -8px;
}

.modal__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  max-height: 40vh;
}

.modal__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--fp-radius);
  background: var(--fp-bg-secondary);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all var(--fp-transition);
}

.modal__item--selected {
  border-color: var(--fp-primary);
  background: var(--fp-primary-bg);
}

.modal__item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal__item-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--fp-text);
}

.modal__item-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal__empty {
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--fp-text-tertiary);
}

.modal__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
