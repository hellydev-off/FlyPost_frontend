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
  <div class="post-card pressable" @click="$emit('click', post.id)">
    <div class="post-card__header">
      <PostStatusBadge :status="post.status" />
      <span class="post-card__date">{{ formatDateTime(post.createdAt) }}</span>
    </div>
    <p class="post-card__content">{{ post.content }}</p>
  </div>
</template>

<style scoped>
.post-card {
  padding: var(--fp-spacing);
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: all var(--fp-transition);
  border: 1px solid transparent;
}

.post-card:active {
  background: var(--fp-bg-tertiary);
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-card__date {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.post-card__content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--fp-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
