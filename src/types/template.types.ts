export type TemplateCategory =
  | 'announcement'
  | 'promo'
  | 'educational'
  | 'engagement'
  | 'news'
  | 'personal'

export interface Template {
  id: string
  userId: string
  title: string
  content: string
  category: TemplateCategory
  variables: string[]
  usageCount: number
  createdAt: string
}

export interface CreateTemplatePayload {
  title: string
  content: string
  category: TemplateCategory
  variables?: string[]
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}

export interface UseTemplatePayload {
  variables: Record<string, string>
}
