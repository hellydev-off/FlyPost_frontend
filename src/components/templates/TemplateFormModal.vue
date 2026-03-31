<script setup lang="ts">
import { reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { CreateTemplatePayload, TemplateCategory } from '@/types/template.types'

const emit = defineEmits<{
  save: [payload: CreateTemplatePayload]
  close: []
}>()

const CATEGORIES: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'announcement', label: 'Анонс' },
  { value: 'promo', label: 'Промо' },
  { value: 'educational', label: 'Обучение' },
  { value: 'engagement', label: 'Вовлечение' },
  { value: 'news', label: 'Новости' },
  { value: 'personal', label: 'Личное' },
]

const form = reactive({
  title: '',
  content: '',
  category: 'announcement' as TemplateCategory,
  variablesRaw: '',
})

const isValid = computed(() => form.title.trim() && form.content.trim())

function save(): void {
  const variables = form.variablesRaw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
  emit('save', {
    title: form.title,
    content: form.content,
    category: form.category,
    variables,
  })
}
</script>

<template>
  <AppModal title="Новый шаблон" @close="emit('close')">
    <div class="form">
      <div class="form__field">
        <label class="form__label">Название</label>
        <input v-model="form.title" class="form__input" placeholder="Название шаблона" />
      </div>

      <div class="form__field">
        <label class="form__label">Категория</label>
        <select v-model="form.category" class="form__input">
          <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="form__field">
        <label class="form__label">Текст шаблона</label>
        <textarea
          v-model="form.content"
          class="form__textarea"
          placeholder="Используй {{переменная}} для динамических значений"
          rows="6"
        />
      </div>

      <div class="form__field">
        <label class="form__label">Переменные (через запятую)</label>
        <input
          v-model="form.variablesRaw"
          class="form__input"
          placeholder="product, price, date"
        />
        <span class="form__hint">Должны совпадать с {{переменными}} в тексте</span>
      </div>

      <AppButton block :disabled="!isValid" @click="save">
        Создать шаблон
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
}

.form__hint {
  font-size: 11px;
  color: var(--fp-text-tertiary);
}

.form__input,
.form__textarea {
  padding: 12px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
  width: 100%;
  box-sizing: border-box;
}

.form__input:focus,
.form__textarea:focus {
  border-color: var(--fp-primary);
  background: var(--fp-bg);
  outline: none;
}

.form__input::placeholder,
.form__textarea::placeholder {
  color: var(--fp-text-tertiary);
}

.form__textarea {
  resize: vertical;
  font-family: inherit;
}
</style>
