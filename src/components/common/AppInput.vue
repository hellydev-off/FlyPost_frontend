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
  gap: 6px;
}

.app-input__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
}

.app-input__field {
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  transition: box-shadow var(--fp-transition), background var(--fp-transition);
  border: 1.5px solid transparent;
}

.app-input__field:focus {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
  background: var(--fp-bg);
}

.app-input__field::placeholder {
  color: var(--fp-text-tertiary);
}
</style>
