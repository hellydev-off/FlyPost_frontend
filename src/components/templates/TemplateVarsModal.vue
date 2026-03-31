<script setup lang="ts">
import { ref, watch } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'

const props = defineProps<{
  variables: string[]
  loading?: boolean
}>()

const emit = defineEmits<{
  apply: [vars: Record<string, string>]
  close: []
}>()

const values = ref<Record<string, string>>({})

watch(
  () => props.variables,
  (vars) => {
    values.value = Object.fromEntries(vars.map(v => [v, '']))
  },
  { immediate: true },
)

function apply(): void {
  emit('apply', { ...values.value })
}
</script>

<template>
  <AppModal title="Заполните переменные" @close="emit('close')">
    <div class="vars-form">
      <p class="vars-form__hint">Замените переменные на нужные значения</p>

      <div
        v-for="variable in variables"
        :key="variable"
        class="vars-form__field"
      >
        <label class="vars-form__label">{{ variable }}</label>
        <input
          v-model="values[variable]"
          class="vars-form__input"
          :placeholder="`Значение для {{${variable}}}`"
        />
      </div>

      <AppButton
        block
        :loading="loading"
        :disabled="variables.some(v => !values[v]?.trim())"
        @click="apply"
      >
        Применить шаблон
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.vars-form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.vars-form__hint {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin: 0;
}

.vars-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vars-form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  text-transform: capitalize;
}

.vars-form__input {
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.vars-form__input:focus {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
  background: var(--fp-bg);
}

.vars-form__input::placeholder {
  color: var(--fp-text-tertiary);
}
</style>
