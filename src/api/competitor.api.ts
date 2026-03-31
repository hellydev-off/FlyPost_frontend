import api from './index'
import { isMockMode, withDelay } from './mock'
import type { Competitor } from '@/types/competitor.types'

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    channelUsername: 'techinsider',
    title: 'Tech Insider',
    lastAnalysis: JSON.stringify({
      memberCount: 45200,
      insights: 'Канал фокусируется на технологических новостях. Публикует 2-3 поста в день в прайм-тайм (9:00 и 19:00). Сильная сторона — оперативность публикаций. Слабость — мало авторского контента, в основном репосты.',
    }),
    analyzedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
  {
    id: '2',
    channelUsername: 'devdigest',
    title: 'Dev Digest',
    lastAnalysis: null,
    analyzedAt: null,
    createdAt: new Date().toISOString(),
  },
]

export const competitorApi = {
  async getAll(): Promise<Competitor[]> {
    if (isMockMode) return withDelay([...mockCompetitors])
    const { data } = await api.get<Competitor[]>('/api/competitors')
    return data
  },

  async add(payload: { channelUsername: string; title: string }): Promise<Competitor> {
    if (isMockMode) {
      const c: Competitor = {
        id: String(Date.now()),
        channelUsername: payload.channelUsername.replace(/^@/, ''),
        title: payload.title,
        lastAnalysis: null,
        analyzedAt: null,
        createdAt: new Date().toISOString(),
      }
      mockCompetitors.unshift(c)
      return withDelay(c)
    }
    const { data } = await api.post<Competitor>('/api/competitors', payload)
    return data
  },

  async delete(id: string): Promise<void> {
    if (isMockMode) {
      const idx = mockCompetitors.findIndex(c => c.id === id)
      if (idx !== -1) mockCompetitors.splice(idx, 1)
      return withDelay(undefined as unknown as void)
    }
    await api.delete(`/api/competitors/${id}`)
  },

  async analyze(id: string): Promise<Competitor> {
    if (isMockMode) {
      const c = mockCompetitors.find(c => c.id === id)!
      c.lastAnalysis = JSON.stringify({
        memberCount: Math.floor(Math.random() * 50000) + 1000,
        insights: 'Канал активно развивается. Публикует 1-2 поста в день. Основная аудитория — молодые специалисты. Хорошо работают экспертные разборы и кейсы. Рекомендуется перенять формат "вопрос-ответ" и регулярные дайджесты.',
      })
      c.analyzedAt = new Date().toISOString()
      return withDelay({ ...c }, 1500)
    }
    const { data } = await api.post<Competitor>(`/api/competitors/${id}/analyze`)
    return data
  },
}
