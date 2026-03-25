import type { Channel } from '@/types/channel.types'

export const mockChannels: Channel[] = [
  {
    id: '1',
    telegramChannelId: '-1001234567890',
    title: 'Tech Новости',
    username: 'technews_mock',
    botIsAdmin: true,
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: '2',
    telegramChannelId: '-1009876543210',
    title: 'Маркетинг Pro',
    username: 'marketing_mock',
    botIsAdmin: true,
    createdAt: '2025-12-15T14:30:00Z',
  },
  {
    id: '3',
    telegramChannelId: '-1001122334455',
    title: 'Личный блог',
    username: null,
    botIsAdmin: false,
    createdAt: '2026-01-10T09:00:00Z',
  },
]
