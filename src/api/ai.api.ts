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

  async weeklyPlan(channelId: string, postsPerDay: number): Promise<WeeklyPlanIdea[]> {
    if (isMockMode) {
      const mockTitles = [
        'Тренды недели', 'Экспертный разбор', 'Кейс из практики',
        'Инструменты и лайфхаки', 'Вопрос–ответ', 'Разбор ошибок',
        'Закулисье канала', 'Подборка ресурсов', 'Советы новичкам',
        'Обзор инструментов', 'История успеха', 'Новости ниши',
        'Чек-лист', 'Топ-5 идей', 'Мотивация',
        'Лайфхаки', 'Аналитика', 'Опрос читателей',
        'Итоги недели', 'Прогнозы', 'Разбор тренда',
        'Мнение эксперта', 'Практические советы', 'Планы на неделю',
        'Вовлечение аудитории', 'Закулисье работы', 'Полезный контент', 'Подводим итоги',
      ]
      const hours = [9, 12, 15, 18]
      const ideas: WeeklyPlanIdea[] = []
      for (let day = 0; day < 7; day++) {
        for (let p = 0; p < postsPerDay; p++) {
          const idx = day * postsPerDay + p
          ideas.push({
            dayIndex: day,
            title: mockTitles[idx % mockTitles.length],
            summary: 'Краткое описание темы поста для планирования контента на неделю.',
            suggestedHour: hours[p % hours.length],
          })
        }
      }
      return withDelay<WeeklyPlanIdea[]>(ideas, 1200)
    }
    const { data } = await api.post<{ ideas: WeeklyPlanIdea[] }>('/api/ai/weekly-plan', { channelId, postsPerDay })
    return data.ideas
  },

  async getPlans(params: { channelId?: string; type?: 'daily' | 'weekly' } = {}): Promise<AiPlan[]> {
    if (isMockMode) return withDelay([], 300)
    const { data } = await api.get<{ plans: AiPlan[] }>('/api/ai/plans', { params })
    return data.plans
  },
}
