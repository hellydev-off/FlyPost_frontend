<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  color?: string
}>()
</script>

<template>
  <div class="stats-card">
    <div class="stats-card__value" :style="color ? { color } : {}">{{ value }}</div>
    <div class="stats-card__label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stats-card {
  flex: 1;
  padding: 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  text-align: center;
  min-width: 0;
}

.stats-card__value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--fp-text);
}

.stats-card__label {
  font-size: 12px;
  color: var(--fp-text-secondary);
  margin-top: 4px;
}
</style>
