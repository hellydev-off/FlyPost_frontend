<script setup lang="ts">
import type { Channel } from '@/types/channel.types'
import AppButton from '@/components/common/AppButton.vue'

defineProps<{
  channel: Channel
}>()

defineEmits<{
  delete: [id: string]
  select: [id: string]
}>()
</script>

<template>
  <div class="channel-card" @click="$emit('select', channel.id)">
    <div class="channel-card__info">
      <div class="channel-card__title">{{ channel.title }}</div>
      <div class="channel-card__username text-hint">
        {{ channel.username ? `@${channel.username}` : 'username не указан' }}
      </div>
      <div class="channel-card__status" :class="{ 'channel-card__status--ok': channel.botIsAdmin }">
        {{ channel.botIsAdmin ? 'Бот — админ' : 'Бот не добавлен' }}
      </div>
    </div>
    <AppButton variant="danger" size="sm" @click.stop="$emit('delete', channel.id)">
      Удалить
    </AppButton>
  </div>
</template>

<style scoped>
.channel-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: opacity var(--fp-transition);
}

.channel-card:active {
  opacity: 0.8;
}

.channel-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.channel-card__title {
  font-weight: 600;
  font-size: 15px;
}

.channel-card__username {
  font-size: 13px;
}

.channel-card__status {
  font-size: 12px;
  color: var(--fp-warning);
  margin-top: 4px;
}

.channel-card__status--ok {
  color: var(--fp-success);
}
</style>
