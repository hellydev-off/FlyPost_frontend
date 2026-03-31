<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  label?: string
  maxLength?: number
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const charCount = computed(() => props.modelValue.length)
</script>

<template>
  <div class="app-textarea">
    <label v-if="label" class="app-textarea__label">{{ label }}</label>
    <textarea
      class="app-textarea__field"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 6"
      :maxlength="maxLength"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div v-if="maxLength" class="app-textarea__counter">
      {{ charCount }} / {{ maxLength }}
    </div>
  </div>
</template>

<style scoped>
.app-textarea {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-textarea__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
}

.app-textarea__field {
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  resize: vertical;
  min-height: 120px;
  transition: box-shadow var(--fp-transition), background var(--fp-transition);
  border: 1.5px solid transparent;
}

.app-textarea__field:focus {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
  background: var(--fp-bg);
}

.app-textarea__field::placeholder {
  color: var(--fp-text-tertiary);
}

.app-textarea__counter {
  text-align: right;
  font-size: 12px;
  color: var(--fp-text-tertiary);
  font-variant-numeric: tabular-nums;
}
</style>
