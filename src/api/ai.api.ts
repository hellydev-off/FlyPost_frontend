import api from './index'
import { isMockMode, withDelay } from './mock'
import type { WeeklyPlanIdea } from '@/types/competitor.types'

export interface GeneratePayload {
  topic: string
  tone: 'neutral' | 'expert' | 'friendly' | 'sales'
  length: 'short' | 'medium' | 'long'
  channelId: string
}

export type ImproveAction = 'shorten' | 'expand' | 'rephrase' | 'fix' | 'tone'

export interface ImprovePayload {
  content: string
  action: ImproveAction
  tone?: string
}

interface AiResponse {
  content: string
}

const mockTexts: Record<string, string> = {
  short: '✨ Краткий пост по вашей теме — основные тезисы и выводы.\n\n#flypost #ai',
  medium: '📝 Подробный пост по вашей теме.\n\nРазбираем ключевые моменты, делимся инсайтами и практическими советами.\n\n#flypost #ai',
  long: '🔥 Глубокий разбор вашей темы\n\nВ этом посте мы подробно рассмотрим все аспекты вопроса.\n\nПрактические рекомендации и выводы.\n\n#flypost #ai #разбор',
}

export const aiApi = {
  async generate(payload: GeneratePayload): Promise<AiResponse> {
    if (isMockMode) {
      const content = mockTexts[payload.length] ?? mockTexts.medium
      return withDelay({ content }, 800)
    }
    const { data } = await api.post<AiResponse>('/api/ai/generate', payload)
    return data
  },

  async improve(payload: ImprovePayload): Promise<AiResponse> {
    if (isMockMode) {
      return withDelay({ content: `[AI: ${payload.action}] ${payload.content}` }, 800)
    }
    const { data } = await api.post<AiResponse>('/api/ai/improve', payload)
    return data
  },

  async weeklyPlan(channelId: string): Promise<WeeklyPlanIdea[]> {
    if (isMockMode) {
      return withDelay<WeeklyPlanIdea[]>([
        { title: 'Тренды недели', summary: 'Обзор главных событий в нише за прошедшую неделю.', suggestedHour: 9 },
        { title: 'Экспертный разбор', summary: 'Глубокий анализ актуальной темы с практическими советами для аудитории.', suggestedHour: 19 },
        { title: 'Кейс из практики', summary: 'Реальная история успеха или провала с конкретными выводами.', suggestedHour: 12 },
        { title: 'Инструменты и лайфхаки', summary: 'Подборка полезных инструментов, которые экономят время.', suggestedHour: 18 },
        { title: 'Вопрос–ответ', summary: 'Отвечаем на самые частые вопросы подписчиков этой недели.', suggestedHour: 20 },
      ], 1200)
    }
    const { data } = await api.post<{ ideas: WeeklyPlanIdea[] }>('/api/ai/weekly-plan', { channelId })
    return data.ideas
  },
}
