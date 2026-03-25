<script setup lang="ts">
import type { Post } from '@/types/post.types'
import PostStatusBadge from './PostStatusBadge.vue'
import { formatDateTime } from '@/utils/formatDate'

defineProps<{
  post: Post
}>()

defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <div class="post-card" @click="$emit('click', post.id)">
    <div class="post-card__header">
      <PostStatusBadge :status="post.status" />
      <span class="post-card__date text-hint">{{ formatDateTime(post.createdAt) }}</span>
    </div>
    <p class="post-card__content">{{ post.content }}</p>
  </div>
</template>

<style scoped>
.post-card {
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: opacity var(--fp-transition);
}

.post-card:active {
  opacity: 0.8;
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--fp-spacing-sm);
}

.post-card__date {
  font-size: 12px;
}

.post-card__content {
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
