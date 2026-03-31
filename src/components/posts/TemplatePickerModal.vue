<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import TemplateVarsModal from '@/components/templates/TemplateVarsModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useTemplatesStore } from '@/stores/useTemplatesStore'
import type { Template, TemplateCategory } from '@/types/template.types'

const emit = defineEmits<{
  pick: [content: string]
  close: []
}>()

const store = useTemplatesStore()
const selectedTemplate = ref<Template | null>(null)
const varsLoading = ref(false)
const searchQuery = ref('')

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  announcement: 'Анонс',
  promo: 'Промо',
  educational: 'Обучение',
  engagement: 'Вовлечение',
  news: 'Новости',
  personal: 'Личное',
}

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return store.templates.filter(t =>
    !q || t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q),
  )
})

onMounted(() => {
  if (store.templates.length === 0) store.getAll()
})

async function selectTemplate(template: Template): Promise<void> {
  if (template.variables.length > 0) {
    selectedTemplate.value = template
  } else {
    const content = await store.useTemplate(template.id, {})
    if (content) emit('pick', content)
  }
}

async function applyVars(vars: Record<string, string>): Promise<void> {
  if (!selectedTemplate.value) return
  varsLoading.value = true
  const content = await store.useTemplate(selectedTemplate.value.id, vars)
  varsLoading.value = false
  if (content) emit('pick', content)
}
</script>

<template>
  <AppModal title="Выбрать шаблон" @close="emit('close')">
    <div class="picker">
      <input
        v-model="searchQuery"
        class="picker__search"
        placeholder="Поиск шаблона..."
      />

      <div v-if="store.loading" class="picker__loading">
        <span class="picker__spinner" />
      </div>

      <div v-else-if="filtered.length === 0" class="picker__empty">
        Шаблонов не найдено
      </div>

      <div v-else class="picker__list">
        <button
          v-for="template in filtered"
          :key="template.id"
          class="picker__item"
          @click="selectTemplate(template)"
        >
          <div class="picker__item-top">
            <span class="picker__badge" :class="`picker__badge--${template.category}`">
              {{ CATEGORY_LABELS[template.category] }}
            </span>
            <span class="picker__usage">
              <AppIcon name="check-circle" :size="12" />
              {{ template.usageCount }}
            </span>
          </div>
          <span class="picker__item-title">{{ template.title }}</span>
          <p class="picker__item-preview">{{ template.content }}</p>
        </button>
      </div>
    </div>

    <TemplateVarsModal
      v-if="selectedTemplate"
      :variables="selectedTemplate.variables"
      :loading="varsLoading"
      @apply="applyVars"
      @close="selectedTemplate = null"
    />
  </AppModal>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
  max-height: 70vh;
}

.picker__search {
  padding: 11px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: border-color var(--fp-transition);
}

.picker__search:focus {
  border-color: var(--fp-primary);
  outline: none;
}

.picker__search::placeholder { color: var(--fp-text-tertiary); }

.picker__loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.picker__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--fp-bg-tertiary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.picker__empty {
  text-align: center;
  padding: 24px;
  color: var(--fp-text-tertiary);
  font-size: 14px;
}

.picker__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 55vh;
}

.picker__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  text-align: left;
  transition: background var(--fp-transition);
  border: 1.5px solid transparent;
}

.picker__item:active {
  background: var(--fp-primary-bg);
  border-color: var(--fp-primary);
}

.picker__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker__badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.picker__badge--announcement { background: #e3f2fd; color: #1565c0; }
.picker__badge--promo        { background: #fce4ec; color: #c62828; }
.picker__badge--educational  { background: #e8f5e9; color: #2e7d32; }
.picker__badge--engagement   { background: #fff3e0; color: #e65100; }
.picker__badge--news         { background: #f3e5f5; color: #6a1b9a; }
.picker__badge--personal     { background: #e0f7fa; color: #00695c; }

.picker__usage {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--fp-text-tertiary);
}

.picker__item-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fp-text);
}

.picker__item-preview {
  font-size: 12px;
  color: var(--fp-text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
  line-height: 1.4;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
