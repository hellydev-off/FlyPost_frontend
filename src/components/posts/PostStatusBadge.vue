<script setup lang="ts">
import { computed } from 'vue'
import type { PostStatus } from '@/types/post.types'
import { useLocaleStore } from '@/stores/useLocaleStore'

const props = defineProps<{
  status: PostStatus
}>()

const { t } = useLocaleStore()

const label = computed(() => t(`postStatus.${props.status}`))
</script>

<template>
  <span class="badge" :class="`badge--${status}`">
    <span class="badge__dot" />
    {{ label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge--draft {
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
}
.badge--draft .badge__dot {
  background: var(--fp-text-tertiary);
}

.badge--published {
  background: var(--fp-success-bg);
  color: var(--fp-success);
}
.badge--published .badge__dot {
  background: var(--fp-success);
}

.badge--scheduled {
  background: var(--fp-info-bg);
  color: var(--fp-info);
}
.badge--scheduled .badge__dot {
  background: var(--fp-info);
}

.badge--failed {
  background: var(--fp-error-bg);
  color: var(--fp-error);
}
.badge--failed .badge__dot {
  background: var(--fp-error);
}
</style>
