import type { ChannelProfile } from '@/types/channel.types'

export const mockChannelProfiles: Record<string, ChannelProfile> = {
  'mock-channel-1': {
    channelId: 'mock-channel-1',
    tone: 'Экспертный и дружелюбный',
    audience: 'Предприниматели и стартаперы 25-40 лет',
    topics: ['бизнес', 'маркетинг', 'продуктивность'],
    forbiddenWords: ['дёшево', 'бесплатно', 'кликбейт'],
    examples: '🚀 Как мы увеличили выручку x3 за 3 месяца...\n\n💡 5 инструментов, которые сэкономят 2 часа в день...',
  },
}
