<script setup lang="ts">
defineProps<{
  height?: string
  width?: string
  radius?: string
}>()
</script>

<template>
  <div
    class="skeleton"
    :style="{
      height: height ?? '20px',
      width: width ?? '100%',
      borderRadius: radius ?? 'var(--fp-radius-sm)',
    }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--tg-theme-secondary-bg-color) 25%,
    rgba(0, 0, 0, 0.04) 50%,
    var(--tg-theme-secondary-bg-color) 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
</style>
