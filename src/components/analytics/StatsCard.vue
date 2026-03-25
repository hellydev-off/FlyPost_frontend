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
    <div class="stats-card__label text-hint">{{ label }}</div>
  </div>
</template>

<style scoped>
.stats-card {
  flex: 1;
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  text-align: center;
  min-width: 0;
}

.stats-card__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stats-card__label {
  font-size: 12px;
  margin-top: 4px;
}
</style>
