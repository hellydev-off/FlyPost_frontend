import type { ScheduledPost } from '@/types/scheduler.types'

const now = Date.now()
const oneDay = 86_400_000

export const mockScheduled: ScheduledPost[] = [
  {
    id: 's1',
    postId: '5',
    channelId: '1',
    content: '📅 Обзор лучших IDE для веб-разработки в 2026 году\n\nСравниваем VS Code, WebStorm, Zed и Cursor.',
    scheduledAt: new Date(now + oneDay).toISOString(),
    status: 'pending',
    createdAt: '2026-03-24T08:00:00Z',
  },
  {
    id: 's2',
    postId: '3',
    channelId: '2',
    content: 'Как увеличить конверсию лендинга в 2 раза без бюджета на рекламу?\n\nРазбираем 7 проверенных стратегий, которые работают в 2026 году.',
    scheduledAt: new Date(now + oneDay * 3).toISOString(),
    status: 'pending',
    createdAt: '2026-03-22T15:00:00Z',
  },
]
