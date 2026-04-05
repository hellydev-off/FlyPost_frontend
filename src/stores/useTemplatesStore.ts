import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { templateApi } from '@/api/template.api'
import { useToastStore } from './useToastStore'
import { useLocaleStore } from './useLocaleStore'
import type { Template, CreateTemplatePayload, UpdateTemplatePayload, TemplateCategory } from '@/types/template.types'

export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Template[]>([])
  const loading = ref(false)
  const activeCategory = ref<TemplateCategory | null>(null)

  const filtered = computed(() =>
    activeCategory.value
      ? templates.value.filter(t => t.category === activeCategory.value)
      : templates.value,
  )

  async function getAll(): Promise<void> {
    loading.value = true
    try {
      templates.value = await templateApi.getAll()
    } catch {
      useToastStore().show(useLocaleStore().t('stores.templates.fetchError'), 'error')
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateTemplatePayload): Promise<Template | null> {
    try {
      const template = await templateApi.create(payload)
      templates.value.unshift(template)
      useToastStore().show(useLocaleStore().t('stores.templates.created'), 'success')
      return template
    } catch {
      useToastStore().show(useLocaleStore().t('stores.templates.createError'), 'error')
      return null
    }
  }

  async function update(id: string, payload: UpdateTemplatePayload): Promise<void> {
    try {
      const updated = await templateApi.update(id, payload)
      const idx = templates.value.findIndex(t => t.id === id)
      if (idx !== -1) templates.value[idx] = updated
      useToastStore().show(useLocaleStore().t('stores.templates.updated'), 'success')
    } catch {
      useToastStore().show(useLocaleStore().t('stores.templates.updateError'), 'error')
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await templateApi.delete(id)
      templates.value = templates.value.filter(t => t.id !== id)
      useToastStore().show(useLocaleStore().t('stores.templates.deleted'), 'success')
    } catch {
      useToastStore().show(useLocaleStore().t('stores.templates.deleteError'), 'error')
    }
  }

  async function useTemplate(id: string, variables: Record<string, string>): Promise<string | null> {
    try {
      return await templateApi.use(id, variables)
    } catch {
      useToastStore().show(useLocaleStore().t('stores.templates.applyError'), 'error')
      return null
    }
  }

  function setCategory(cat: TemplateCategory | null): void {
    activeCategory.value = cat
  }

  return {
    templates,
    loading,
    activeCategory,
    filtered,
    getAll,
    create,
    update,
    remove,
    useTemplate,
    setCategory,
  }
})
