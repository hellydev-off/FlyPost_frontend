export type AchievementType =
  | 'first_post'
  | 'posts_10'
  | 'posts_50'
  | 'first_scheduled'
  | 'streak_30'
  | 'subs_1000'

export interface Achievement {
  id: string
  userId: string
  type: AchievementType
  unlockedAt: string
}

export interface AchievementMeta {
  type: AchievementType
  emoji: string
  title: string
  description: string
}

export const ACHIEVEMENT_META: Record<AchievementType, AchievementMeta> = {
  first_post: {
    type: 'first_post',
    emoji: '🚀',
    title: 'Первый пост',
    description: 'Создайте свой первый пост',
  },
  posts_10: {
    type: 'posts_10',
    emoji: '✅',
    title: '10 публикаций',
    description: 'Опубликуйте 10 постов',
  },
  posts_50: {
    type: 'posts_50',
    emoji: '🏆',
    title: '50 публикаций',
    description: 'Опубликуйте 50 постов',
  },
  first_scheduled: {
    type: 'first_scheduled',
    emoji: '⏰',
    title: 'Планировщик',
    description: 'Запланируйте свой первый пост',
  },
  streak_30: {
    type: 'streak_30',
    emoji: '🔥',
    title: '30 дней подряд',
    description: 'Публикуйте посты 30 дней без перерыва',
  },
  subs_1000: {
    type: 'subs_1000',
    emoji: '🎉',
    title: '1000 подписчиков',
    description: 'Достигните 1000 подписчиков на канале',
  },
}
