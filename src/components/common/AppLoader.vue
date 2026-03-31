<script setup lang="ts">
defineProps<{
  size?: number
}>()
</script>

<template>
  <div class="loader">
    <span
      class="loader__spinner"
      :style="{ width: `${size ?? 32}px`, height: `${size ?? 32}px` }"
    />
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  padding: var(--fp-spacing);
}

.loader__spinner {
  border: 3px solid var(--fp-bg-tertiary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
