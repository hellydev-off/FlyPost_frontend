<script setup lang="ts">
import type { PostStatus } from '@/types/post.types'

defineProps<{
  status: PostStatus
}>()

const labels: Record<PostStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликован',
  scheduled: 'Запланирован',
  failed: 'Ошибка',
}
</script>

<template>
  <span class="badge" :class="`badge--${status}`">
    {{ labels[status] }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge--draft {
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-hint-color);
}

.badge--published {
  background: rgba(52, 199, 89, 0.15);
  color: var(--fp-success);
}

.badge--scheduled {
  background: rgba(0, 122, 255, 0.15);
  color: var(--fp-info);
}

.badge--failed {
  background: rgba(255, 59, 48, 0.15);
  color: var(--fp-error);
}
</style>
