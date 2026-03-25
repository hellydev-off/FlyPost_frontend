<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  type?: string
  label?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="app-input">
    <label v-if="label" class="app-input__label">{{ label }}</label>
    <input
      class="app-input__field"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-xs);
}

.app-input__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-theme-hint-color);
}

.app-input__field {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
  transition: box-shadow var(--fp-transition);
}

.app-input__field:focus {
  box-shadow: 0 0 0 2px var(--tg-theme-button-color);
}

.app-input__field::placeholder {
  color: var(--tg-theme-hint-color);
}
</style>
