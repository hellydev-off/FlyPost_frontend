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
</script>

<template>
  <!-- Триггер -->
  <button
    v-if="channelsStore.channels.length > 0"
    class="ch-sw"
    :class="{ 'ch-sw--open': open }"
    @click="open = true"
  >
    <span class="ch-sw__icon">
      <AppIcon name="channels" :size="14" color="var(--fp-primary)" />
    </span>
    <span class="ch-sw__name">
      {{ channelsStore.selectedChannel?.title ?? 'Канал' }}
    </span>
    <AppIcon name="chevron-down" :size="13" color="var(--fp-text-tertiary)" class="ch-sw__arrow" />
  </button>

  <!-- Модалка (bottom sheet) -->
  <Teleport to="body">
    <Transition name="sheet-overlay">
      <div v-if="open" class="ch-overlay" @click.self="open = false">
        <Transition name="sheet-slide">
          <div v-if="open" class="ch-sheet">
            <!-- Handle -->
            <div class="ch-sheet__handle" />

            <!-- Header -->
            <div class="ch-sheet__header">
              <h3 class="ch-sheet__title">Рабочий канал</h3>
              <button class="ch-sheet__close" @click="open = false">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- List -->
            <div class="ch-sheet__list">
              <button
                v-for="ch in channelsStore.channels"
                :key="ch.id"
                class="ch-sheet__item"
                :class="{ 'ch-sheet__item--active': ch.id === channelsStore.selectedChannelId }"
                @click="select(ch.id)"
              >
                <span class="ch-sheet__item-icon">
                  <AppIcon name="channels" :size="18" color="var(--fp-primary)" />
                </span>
                <div class="ch-sheet__item-info">
                  <span class="ch-sheet__item-name">{{ ch.title }}</span>
                  <span v-if="ch.username" class="ch-sheet__item-username">@{{ ch.username }}</span>
                </div>
                <div v-if="ch.id === channelsStore.selectedChannelId" class="ch-sheet__item-check">
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
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 5px;
  background: var(--fp-bg-secondary);
  border-radius: 20px;
  transition: background var(--fp-transition);
  flex-shrink: 0;
  min-width: 0;
  max-width: 160px;
}

.ch-sw:active { background: var(--fp-bg-tertiary); }

.ch-sw__icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
.ch-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* ── Sheet ───────────────────────────────────── */
.ch-sheet {
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

/* ── Handle ──────────────────────────────────── */
.ch-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 10px auto 0;
}

/* ── Header ──────────────────────────────────── */
.ch-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 12px;
}

.ch-sheet__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--fp-text);
}

.ch-sheet__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
  flex-shrink: 0;
  transition: background var(--fp-transition);
}

.ch-sheet__close:active { background: var(--fp-bg-tertiary); }

/* ── List ────────────────────────────────────── */
.ch-sheet__list {
  display: flex;
  flex-direction: column;
  padding: 0 0 12px;
}

.ch-sheet__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 20px;
  transition: background var(--fp-transition);
  text-align: left;
}

.ch-sheet__item:active { background: var(--fp-bg-secondary); }
.ch-sheet__item--active { background: var(--fp-primary-bg); }

.ch-sheet__item-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ch-sheet__item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ch-sheet__item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ch-sheet__item-username {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.ch-sheet__item-check {
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
.sheet-overlay-enter-active, .sheet-overlay-leave-active { transition: opacity 0.22s ease; }
.sheet-overlay-enter-from,   .sheet-overlay-leave-to     { opacity: 0; }

.sheet-slide-enter-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-slide-leave-active { transition: transform 0.22s ease; }
.sheet-slide-enter-from   { transform: translateY(100%); }
.sheet-slide-leave-to     { transform: translateY(100%); }
</style>
