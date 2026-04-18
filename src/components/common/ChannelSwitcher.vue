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

// Детерминированный цвет по названию канала
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

  <!-- Боттомшит -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="ch-sw-sheet" @click.self="open = false">
        <div class="ch-sw-sheet__body">
          <div class="ch-sw-sheet__handle" />
          <p class="ch-sw-sheet__title">Рабочий канал</p>

          <div class="ch-sw-sheet__grid">
            <button
              v-for="ch in channelsStore.channels"
              :key="ch.id"
              class="ch-sw-card"
              :class="{ 'ch-sw-card--active': ch.id === channelsStore.selectedChannelId }"
              @click="select(ch.id)"
            >
              <div
                class="ch-sw-card__avatar"
                :style="{ background: channelColor(ch.title) }"
              >
                {{ channelInitials(ch.title) }}
                <span v-if="ch.id === channelsStore.selectedChannelId" class="ch-sw-card__badge">
                  <AppIcon name="check" :size="10" color="#fff" />
                </span>
              </div>
              <span class="ch-sw-card__name">{{ ch.title }}</span>
              <span v-if="ch.username" class="ch-sw-card__username">@{{ ch.username }}</span>
            </button>
          </div>
        </div>
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
  max-width: 190px;
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
  max-width: 110px;
}

.ch-sw__arrow {
  flex-shrink: 0;
  transition: transform var(--fp-transition);
}

.ch-sw--open .ch-sw__arrow { transform: rotate(180deg); }

/* ── Sheet ───────────────────────────────────── */
.ch-sw-sheet {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.ch-sw-sheet__body {
  width: 100%;
  background: var(--fp-bg);
  border-radius: 24px 24px 0 0;
  padding-bottom: calc(max(env(safe-area-inset-bottom), 16px) + 12px);
}

.ch-sw-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 12px auto 0;
}

.ch-sw-sheet__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
  text-align: center;
  padding: 16px 16px 12px;
}

/* ── Grid ────────────────────────────────────── */
.ch-sw-sheet__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  padding: 0 16px 4px;
}

/* ── Card ────────────────────────────────────── */
.ch-sw-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px 14px;
  background: var(--fp-bg-secondary);
  border-radius: 16px;
  border: 2px solid transparent;
  transition: all var(--fp-transition);
  position: relative;
}

.ch-sw-card:active { transform: scale(0.96); }

.ch-sw-card--active {
  border-color: var(--fp-primary);
  background: var(--fp-primary-bg);
}

.ch-sw-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  position: relative;
  flex-shrink: 0;
}

.ch-sw-card__badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: var(--fp-primary);
  border-radius: 50%;
  border: 2px solid var(--fp-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ch-sw-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.ch-sw-card__username {
  font-size: 11px;
  color: var(--fp-text-tertiary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* ── Transitions ─────────────────────────────── */
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .ch-sw-sheet__body,
.sheet-leave-active .ch-sw-sheet__body  { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to      { opacity: 0; }
.sheet-enter-from .ch-sw-sheet__body,
.sheet-leave-to   .ch-sw-sheet__body    { transform: translateY(100%); }
</style>
