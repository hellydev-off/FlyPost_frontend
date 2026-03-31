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
      borderRadius: radius ?? 'var(--fp-radius)',
    }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--fp-bg-secondary) 25%,
    var(--fp-bg-tertiary) 50%,
    var(--fp-bg-secondary) 75%
  );
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
</style>
