<script setup lang="ts">
import type { Channel } from '@/types/channel.types'
import AppIcon from '@/components/common/AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

defineProps<{
  channel: Channel
}>()

defineEmits<{
  delete: [id: string]
  select: [id: string]
  profile: [id: string]
}>()

const { t } = useLocaleStore()
</script>

<template>
  <div class="channel-card pressable" @click="$emit('select', channel.id)">
    <div class="channel-card__avatar">
      {{ channel.title[0]?.toUpperCase() ?? '?' }}
    </div>
    <div class="channel-card__info">
      <div class="channel-card__title">{{ channel.title }}</div>
      <div class="channel-card__username">
        {{ channel.username ? `@${channel.username}` : t('channelCard.noUsername') }}
      </div>
      <div class="channel-card__status" :class="{ 'channel-card__status--ok': channel.botIsAdmin }">
        <span class="channel-card__status-dot" />
        {{ channel.botIsAdmin ? t('channelCard.botAdmin') : t('channelCard.botNotAdded') }}
      </div>
    </div>
    <div class="channel-card__actions">
      <button
        class="channel-card__action-btn channel-card__action-btn--voice"
        title="Голос канала"
        @click.stop="$emit('profile', channel.id)"
      >
        <AppIcon name="wand" :size="17" />
      </button>
      <button
        class="channel-card__action-btn channel-card__action-btn--delete"
        title="Удалить"
        @click.stop="$emit('delete', channel.id)"
      >
        <AppIcon name="trash" :size="17" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--fp-spacing);
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: all var(--fp-transition);
}

.channel-card:active {
  background: var(--fp-bg-tertiary);
}

.channel-card__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.channel-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.channel-card__title {
  font-weight: 600;
  font-size: 15px;
  color: var(--fp-text);
}

.channel-card__username {
  font-size: 13px;
  color: var(--fp-text-secondary);
}

.channel-card__status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--fp-warning);
  margin-top: 2px;
}

.channel-card__status--ok {
  color: var(--fp-success);
}

.channel-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.channel-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.channel-card__action-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-tertiary);
  transition: all var(--fp-transition);
}

.channel-card__action-btn:active {
  transform: scale(0.9);
}

.channel-card__action-btn--voice:active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
}

.channel-card__action-btn--delete:active {
  background: var(--fp-error-bg);
  color: var(--fp-error);
}
</style>
