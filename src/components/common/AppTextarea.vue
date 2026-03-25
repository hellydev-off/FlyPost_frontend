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
  gap: var(--fp-spacing-xs);
}

.app-textarea__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-theme-hint-color);
}

.app-textarea__field {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
  resize: vertical;
  min-height: 120px;
  transition: box-shadow var(--fp-transition);
}

.app-textarea__field:focus {
  box-shadow: 0 0 0 2px var(--tg-theme-button-color);
}

.app-textarea__field::placeholder {
  color: var(--tg-theme-hint-color);
}

.app-textarea__counter {
  text-align: right;
  font-size: 12px;
  color: var(--tg-theme-hint-color);
}
</style>
