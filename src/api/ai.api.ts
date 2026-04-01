import api from './index'
import { isMockMode, withDelay } from './mock'
import type { WeeklyPlanIdea, DailyPlanIdea, AiPlan } from '@/types/competitor.types'

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
  short: '✨ Краткий пост по вашей теме — основные тезисы и выводы.\n\n#neopost #ai',
  medium: '📝 Подробный пост по вашей теме.\n\nРазбираем ключевые моменты, делимся инсайтами и практическими советами.\n\n#neopost #ai',
  long: '🔥 Глубокий разбор вашей темы\n\nВ этом посте мы подробно рассмотрим все аспекты вопроса.\n\nПрактические рекомендации и выводы.\n\n#neopost #ai #разбор',
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

  async dailyPlan(channelId: string, startHour: number, intervalMinutes: number): Promise<{ ideas: DailyPlanIdea[]; warning?: string }> {
    if (isMockMode) {
      const slots = []
      let cur = startHour * 60
      while (cur <= 22 * 60 && slots.length < 8) {
        const h = Math.floor(cur / 60)
        const m = cur % 60
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
        cur += intervalMinutes
      }
      return withDelay({
        ideas: slots.map((t) => ({ title: `Идея для ${t}`, summary: 'Мок-описание поста.', scheduledTime: t })),
      }, 1200)
    }
    const { data } = await api.post<{ ideas: DailyPlanIdea[]; warning?: string }>('/api/ai/daily-plan', {
      channelId,
      startHour,
      intervalMinutes,
    })
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

  async getPlans(params: { channelId?: string; type?: 'daily' | 'weekly' } = {}): Promise<AiPlan[]> {
    if (isMockMode) return withDelay([], 300)
    const { data } = await api.get<{ plans: AiPlan[] }>('/api/ai/plans', { params })
    return data.plans
  },
}
