import api from './index'
import { isMockMode, withDelay } from './mock'

export interface GeneratePayload {
  topic: string
  tone: 'neutral' | 'expert' | 'friendly' | 'sales'
  length: 'short' | 'medium' | 'long'
  channelId: string
}

interface GenerateResponse {
  content: string
}

const mockTexts: Record<string, string> = {
  short: '✨ Краткий пост по вашей теме — основные тезисы и выводы.\n\n#flypost #ai',
  medium: '📝 Подробный пост по вашей теме.\n\nРазбираем ключевые моменты, делимся инсайтами и практическими советами. Этот материал поможет вам лучше разобраться в вопросе.\n\nСохраняйте и делитесь с коллегами!\n\n#flypost #ai',
  long: '🔥 Глубокий разбор вашей темы\n\nВ этом посте мы подробно рассмотрим все аспекты вопроса.\n\nВо-первых, важно понимать контекст — без этого невозможно принять правильное решение.\n\nВо-вторых, практические рекомендации. Мы собрали лучшие практики и проверенные методы, которые работают прямо сейчас.\n\nВ-третьих, выводы и следующие шаги. Что делать после прочтения, чтобы получить максимум пользы.\n\nСохраняйте этот пост — он пригодится!\n\n#flypost #ai #разбор',
}

export const aiApi = {
  async generate(payload: GeneratePayload): Promise<GenerateResponse> {
    if (isMockMode) {
      const content = mockTexts[payload.length] ?? mockTexts.medium
      return withDelay({ content }, 800)
    }
    const { data } = await api.post<GenerateResponse>('/api/ai/generate', payload)
    return data
  },
}
