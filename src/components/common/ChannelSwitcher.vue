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
    <span class="ch-sw__dot" />
    <span class="ch-sw__name">
      {{ channelsStore.selectedChannel?.title ?? 'Выберите канал' }}
    </span>
    <AppIcon name="chevron-down" :size="14" color="var(--fp-text-secondary)" class="ch-sw__arrow" />
  </button>

  <!-- Боттомшит -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="ch-sw-sheet" @click.self="open = false">
        <div class="ch-sw-sheet__body">
          <div class="ch-sw-sheet__handle" />
          <p class="ch-sw-sheet__title">Выберите канал</p>

          <div class="ch-sw-sheet__list">
            <button
              v-for="ch in channelsStore.channels"
              :key="ch.id"
              class="ch-sw-sheet__item"
              :class="{ 'ch-sw-sheet__item--active': ch.id === channelsStore.selectedChannelId }"
              @click="select(ch.id)"
            >
              <span class="ch-sw-sheet__item-icon">📢</span>
              <span class="ch-sw-sheet__item-name">{{ ch.title }}</span>
              <span v-if="ch.username" class="ch-sw-sheet__item-username">@{{ ch.username }}</span>
              <AppIcon
                v-if="ch.id === channelsStore.selectedChannelId"
                name="check"
                :size="16"
                color="var(--fp-primary)"
                class="ch-sw-sheet__item-check"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Trigger pill */
.ch-sw {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 10px;
  background: var(--fp-bg-secondary);
  border-radius: 20px;
  transition: background var(--fp-transition);
  max-width: 200px;
}

.ch-sw:active {
  background: var(--fp-bg-tertiary);
}

.ch-sw__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fp-primary);
  flex-shrink: 0;
}

.ch-sw__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.ch-sw__arrow {
  flex-shrink: 0;
  transition: transform var(--fp-transition);
}

.ch-sw--open .ch-sw__arrow {
  transform: rotate(180deg);
}

/* Bottom sheet */
.ch-sw-sheet {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.ch-sw-sheet__body {
  width: 100%;
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  padding: 0 0 calc(max(env(safe-area-inset-bottom), 16px) + 8px);
}

.ch-sw-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 12px auto 0;
}

.ch-sw-sheet__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 14px 16px 8px;
}

.ch-sw-sheet__list {
  display: flex;
  flex-direction: column;
}

.ch-sw-sheet__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  text-align: left;
  transition: background var(--fp-transition);
}

.ch-sw-sheet__item:active {
  background: var(--fp-bg-secondary);
}

.ch-sw-sheet__item--active {
  background: var(--fp-primary-bg);
}

.ch-sw-sheet__item-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.ch-sw-sheet__item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--fp-text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ch-sw-sheet__item-username {
  font-size: 12px;
  color: var(--fp-text-tertiary);
  flex-shrink: 0;
}

.ch-sw-sheet__item-check {
  flex-shrink: 0;
  margin-left: 4px;
}

/* Transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .ch-sw-sheet__body,
.sheet-leave-active .ch-sw-sheet__body {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .ch-sw-sheet__body,
.sheet-leave-to .ch-sw-sheet__body {
  transform: translateY(100%);
}
</style>
