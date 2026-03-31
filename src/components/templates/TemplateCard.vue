<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppButton from '@/components/common/AppButton.vue'
import type { Template, TemplateCategory } from '@/types/template.types'

const props = defineProps<{ template: Template }>()

const emit = defineEmits<{
  use: [template: Template]
  update: [id: string, payload: { title: string; content: string; category: TemplateCategory; variables: string[] }]
  delete: [id: string]
}>()

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  announcement: 'Анонс',
  promo: 'Промо',
  educational: 'Обучение',
  engagement: 'Вовлечение',
  news: 'Новости',
  personal: 'Личное',
}

const CATEGORIES: TemplateCategory[] = ['announcement', 'promo', 'educational', 'engagement', 'news', 'personal']

const isEditing = ref(false)
const form = reactive({
  title: '',
  content: '',
  category: '' as TemplateCategory,
  variablesRaw: '',
})

function startEdit(): void {
  form.title = props.template.title
  form.content = props.template.content
  form.category = props.template.category
  form.variablesRaw = props.template.variables.join(', ')
  isEditing.value = true
}

function cancelEdit(): void {
  isEditing.value = false
}

function saveEdit(): void {
  const variables = form.variablesRaw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
  emit('update', props.template.id, {
    title: form.title,
    content: form.content,
    category: form.category,
    variables,
  })
  isEditing.value = false
}
</script>

<template>
  <div class="tcard" :class="{ 'tcard--editing': isEditing }">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="tcard__header">
        <span class="tcard__badge" :class="`tcard__badge--${template.category}`">
          {{ CATEGORY_LABELS[template.category] }}
        </span>
        <span class="tcard__usage">{{ template.usageCount }} исп.</span>
      </div>

      <h3 class="tcard__title">{{ template.title }}</h3>
      <p class="tcard__preview">{{ template.content }}</p>

      <div v-if="template.variables.length > 0" class="tcard__vars">
        <span
          v-for="v in template.variables"
          :key="v"
          class="tcard__var"
          v-text="'{{' + v + '}}'"
        />
      </div>

      <div class="tcard__actions">
        <AppButton size="sm" @click="emit('use', template)">Использовать</AppButton>
        <button class="tcard__icon-btn" title="Редактировать" @click="startEdit">
          <AppIcon name="draft" :size="17" />
        </button>
        <button class="tcard__icon-btn tcard__icon-btn--danger" title="Удалить" @click="emit('delete', template.id)">
          <AppIcon name="trash" :size="17" />
        </button>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="tcard__edit">
        <input v-model="form.title" class="tcard__input" placeholder="Название шаблона" />

        <select v-model="form.category" class="tcard__input">
          <option v-for="cat in CATEGORIES" :key="cat" :value="cat">
            {{ CATEGORY_LABELS[cat] }}
          </option>
        </select>

        <textarea v-model="form.content" class="tcard__textarea" placeholder="Текст шаблона..." rows="5" />

        <input
          v-model="form.variablesRaw"
          class="tcard__input"
          placeholder="Переменные через запятую: product, price"
        />

        <div class="tcard__edit-actions">
          <AppButton size="sm" @click="saveEdit">Сохранить</AppButton>
          <AppButton size="sm" variant="ghost" @click="cancelEdit">Отмена</AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tcard {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-lg);
  padding: var(--fp-spacing);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1.5px solid transparent;
  transition: border-color var(--fp-transition);
}

.tcard--editing {
  border-color: var(--fp-primary);
}

.tcard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tcard__badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tcard__badge--announcement { background: #e3f2fd; color: #1565c0; }
.tcard__badge--promo        { background: #fce4ec; color: #c62828; }
.tcard__badge--educational  { background: #e8f5e9; color: #2e7d32; }
.tcard__badge--engagement   { background: #fff3e0; color: #e65100; }
.tcard__badge--news         { background: #f3e5f5; color: #6a1b9a; }
.tcard__badge--personal     { background: #e0f7fa; color: #00695c; }

.tcard__usage {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

.tcard__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--fp-text);
  margin: 0;
}

.tcard__preview {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  white-space: pre-wrap;
}

.tcard__vars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tcard__var {
  font-size: 11px;
  font-family: monospace;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  padding: 2px 8px;
  border-radius: 6px;
}

.tcard__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.tcard__icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fp-bg);
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
  flex-shrink: 0;
}

.tcard__icon-btn:active { transform: scale(0.9); }
.tcard__icon-btn--danger:active { color: var(--fp-danger, #e53935); }

/* Edit form */
.tcard__edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tcard__input,
.tcard__textarea {
  padding: 10px 14px;
  background: var(--fp-bg);
  border-radius: var(--fp-radius);
  font-size: 14px;
  color: var(--fp-text);
  border: 1.5px solid var(--fp-border);
  transition: border-color var(--fp-transition);
  width: 100%;
  box-sizing: border-box;
}

.tcard__input:focus,
.tcard__textarea:focus {
  border-color: var(--fp-primary);
  outline: none;
}

.tcard__textarea {
  resize: vertical;
  font-family: inherit;
}

.tcard__edit-actions {
  display: flex;
  gap: 8px;
}
</style>
