<script setup lang="ts">
import { ref } from 'vue'
import { useChannelsStore } from '@/stores/useChannelsStore'
import AppIcon from '@/components/common/AppIcon.vue'

const channelsStore = useChannelsStore()
const open = ref(false)

function select(id: string): void {
  channelsStore.selectChannel(id)
  open.value = false
}

function channelInitials(title: string): string {
  return title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4']
function channelColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}
</script>

<template>
  <!-- Триггер -->
  <button
    v-if="channelsStore.channels.length > 0"
    class="ch-sw"
    :class="{ 'ch-sw--open': open }"
    @click="open = true"
  >
    <span
      class="ch-sw__avatar"
      :style="{ background: channelColor(channelsStore.selectedChannel?.title ?? '') }"
    >
      {{ channelInitials(channelsStore.selectedChannel?.title ?? '?') }}
    </span>
    <span class="ch-sw__name">
      {{ channelsStore.selectedChannel?.title ?? 'Канал' }}
    </span>
    <AppIcon name="chevron-down" :size="13" color="var(--fp-text-tertiary)" class="ch-sw__arrow" />
  </button>

  <!-- Модалка -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="ch-modal-overlay" @click.self="open = false">
        <Transition name="modal-scale">
          <div v-if="open" class="ch-modal">
            <!-- Header -->
            <div class="ch-modal__header">
              <!-- SVG icon -->
              <div class="ch-modal__icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="var(--fp-primary-bg)" />
                  <path d="M10 20 Q16 10 22 20" stroke="var(--fp-primary)" stroke-width="2" stroke-linecap="round" fill="none"/>
                  <circle cx="10" cy="20" r="2.5" fill="var(--fp-primary)" />
                  <circle cx="22" cy="20" r="2.5" fill="var(--fp-primary)" />
                  <circle cx="16" cy="13" r="2.5" fill="var(--fp-primary)" />
                </svg>
              </div>
              <h3 class="ch-modal__title">Рабочий канал</h3>
              <button class="ch-modal__close" @click="open = false">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- List -->
            <div class="ch-modal__list">
              <button
                v-for="ch in channelsStore.channels"
                :key="ch.id"
                class="ch-modal__item"
                :class="{ 'ch-modal__item--active': ch.id === channelsStore.selectedChannelId }"
                @click="select(ch.id)"
              >
                <span
                  class="ch-modal__item-avatar"
                  :style="{ background: channelColor(ch.title) }"
                >
                  {{ channelInitials(ch.title) }}
                </span>
                <div class="ch-modal__item-info">
                  <span class="ch-modal__item-name">{{ ch.title }}</span>
                  <span v-if="ch.username" class="ch-modal__item-username">@{{ ch.username }}</span>
                </div>
                <div v-if="ch.id === channelsStore.selectedChannelId" class="ch-modal__item-check">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="var(--fp-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Trigger ─────────────────────────────────── */
.ch-sw {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 5px;
  background: var(--fp-bg-secondary);
  border-radius: 20px;
  transition: background var(--fp-transition);
  max-width: 180px;
}

.ch-sw:active { background: var(--fp-bg-tertiary); }

.ch-sw__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.ch-sw__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.ch-sw__arrow {
  flex-shrink: 0;
  transition: transform var(--fp-transition);
}

.ch-sw--open .ch-sw__arrow { transform: rotate(180deg); }

/* ── Overlay ─────────────────────────────────── */
.ch-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ── Modal ───────────────────────────────────── */
.ch-modal {
  background: var(--fp-bg);
  border-radius: 20px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* ── Modal header ────────────────────────────── */
.ch-modal__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--fp-border);
}

.ch-modal__icon {
  flex-shrink: 0;
  display: flex;
}

.ch-modal__title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
}

.ch-modal__close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
  flex-shrink: 0;
  transition: background var(--fp-transition);
}

.ch-modal__close:active { background: var(--fp-bg-tertiary); }

/* ── List ────────────────────────────────────── */
.ch-modal__list {
  display: flex;
  flex-direction: column;
  padding: 8px 0 8px;
}

.ch-modal__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  transition: background var(--fp-transition);
  text-align: left;
}

.ch-modal__item:active { background: var(--fp-bg-secondary); }

.ch-modal__item--active { background: var(--fp-primary-bg); }

.ch-modal__item-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.ch-modal__item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ch-modal__item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ch-modal__item-username {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.ch-modal__item-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  border: 1.5px solid var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Transitions ─────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }

.modal-scale-enter-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease; }
.modal-scale-leave-active { transition: transform 0.18s ease, opacity 0.18s ease; }
.modal-scale-enter-from   { transform: scale(0.88); opacity: 0; }
.modal-scale-leave-to     { transform: scale(0.92); opacity: 0; }
</style>
