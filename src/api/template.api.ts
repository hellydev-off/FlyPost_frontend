import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockTemplates } from './mock/mockTemplates'
import type { Template, CreateTemplatePayload, UpdateTemplatePayload } from '@/types/template.types'

let mockData = [...mockTemplates]

export const templateApi = {
  async getAll(category?: string): Promise<Template[]> {
    if (isMockMode) {
      const result = category ? mockData.filter(t => t.category === category) : mockData
      return withDelay([...result])
    }
    const { data } = await api.get<Template[]>('/api/templates', { params: { category } })
    return data
  },

  async create(payload: CreateTemplatePayload): Promise<Template> {
    if (isMockMode) {
      const template: Template = {
        id: `tmpl-${Date.now()}`,
        userId: 'mock-1',
        usageCount: 0,
        createdAt: new Date().toISOString(),
        variables: [],
        ...payload,
      }
      mockData.unshift(template)
      return withDelay({ ...template })
    }
    const { data } = await api.post<Template>('/api/templates', payload)
    return data
  },

  async update(id: string, payload: UpdateTemplatePayload): Promise<Template> {
    if (isMockMode) {
      const idx = mockData.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Template not found')
      mockData[idx] = { ...mockData[idx], ...payload }
      return withDelay({ ...mockData[idx] })
    }
    const { data } = await api.patch<Template>(`/api/templates/${id}`, payload)
    return data
  },

  async delete(id: string): Promise<void> {
    if (isMockMode) {
      mockData = mockData.filter(t => t.id !== id)
      return withDelay(undefined)
    }
    await api.delete(`/api/templates/${id}`)
  },

  async use(id: string, variables: Record<string, string>): Promise<string> {
    if (isMockMode) {
      const template = mockData.find(t => t.id === id)
      if (!template) throw new Error('Template not found')
      let content = template.content
      for (const [key, value] of Object.entries(variables)) {
        content = content.replaceAll(`{{${key}}}`, value)
      }
      template.usageCount++
      return withDelay(content)
    }
    const { data } = await api.post<{ content: string }>(`/api/templates/${id}/use`, { variables })
    return data.content
  },
}
