export type PlanKey = 'free' | 'start' | 'pro' | 'max'
export type PeriodMonths = 1 | 3 | 6 | 12

export interface PlanLimits {
  channels: number             // -1 = unlimited
  scheduledPosts: number
  aiGenerationsPerMonth: number
  templates: number
  fullAnalytics: boolean
  competitors: boolean
  weeklyPlan: boolean
  voiceProfile: boolean
}

export interface SubscriptionUsage {
  aiGenerations: number
  scheduledPosts: number
  channels: number
  templates: number
}

export interface SubscriptionStatus {
  plan: PlanKey
  effectivePlan: PlanKey
  isTrial: boolean
  trialDaysLeft: number | null
  trialEndsAt: string | null
  subscriptionEndsAt: string | null
  usage: SubscriptionUsage
  limits: PlanLimits
}

export interface PlanMeta {
  name: string
  emoji: string
  description: string
  color: string
  gradient: string
}

export const PLAN_META: Record<PlanKey, PlanMeta> = {
  free: {
    name: 'Free',
    emoji: '🌱',
    description: 'Базовые возможности',
    color: '#94A3B8',
    gradient: 'linear-gradient(135deg, #64748B, #94A3B8)',
  },
  start: {
    name: 'Старт',
    emoji: '🚀',
    description: 'Для начинающих авторов',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
  },
  pro: {
    name: 'Про',
    emoji: '⚡',
    description: 'Для активных авторов',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
  },
  max: {
    name: 'Максимум',
    emoji: '👑',
    description: 'Безлимитные возможности',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
  },
}

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  free: {
    channels: 1,
    scheduledPosts: 5,
    aiGenerationsPerMonth: 0,
    templates: 0,
    fullAnalytics: false,
    competitors: false,
    weeklyPlan: false,
    voiceProfile: false,
  },
  start: {
    channels: 2,
    scheduledPosts: 20,
    aiGenerationsPerMonth: 15,
    templates: 5,
    fullAnalytics: false,
    competitors: false,
    weeklyPlan: false,
    voiceProfile: false,
  },
  pro: {
    channels: 5,
    scheduledPosts: 60,
    aiGenerationsPerMonth: 50,
    templates: 20,
    fullAnalytics: true,
    competitors: true,
    weeklyPlan: true,
    voiceProfile: true,
  },
  max: {
    channels: -1,
    scheduledPosts: -1,
    aiGenerationsPerMonth: -1,
    templates: -1,
    fullAnalytics: true,
    competitors: true,
    weeklyPlan: true,
    voiceProfile: true,
  },
}

export interface PricePeriod {
  total: number
  perMonth: number
  save?: number
}

export const PLAN_PRICES: Record<Exclude<PlanKey, 'free'>, Record<PeriodMonths, PricePeriod>> = {
  start: {
    1:  { total: 299,  perMonth: 299 },
    3:  { total: 799,  perMonth: 266,  save: 11 },
    6:  { total: 1490, perMonth: 248,  save: 17 },
    12: { total: 2690, perMonth: 224,  save: 25 },
  },
  pro: {
    1:  { total: 699,  perMonth: 699 },
    3:  { total: 1890, perMonth: 630,  save: 10 },
    6:  { total: 3490, perMonth: 582,  save: 17 },
    12: { total: 5990, perMonth: 499,  save: 28 },
  },
  max: {
    1:  { total: 1299,  perMonth: 1299 },
    3:  { total: 3490,  perMonth: 1163, save: 10 },
    6:  { total: 6490,  perMonth: 1082, save: 17 },
    12: { total: 10990, perMonth: 916,  save: 29 },
  },
}

/** Human-readable messages for limit error codes returned by backend */
export const LIMIT_MESSAGES: Record<string, string> = {
  LIMIT_CHANNELS:                  'Достигнут лимит каналов',
  LIMIT_SCHEDULED:                 'Достигнут лимит запланированных постов',
  LIMIT_AI:                        'Достигнут лимит AI-генераций',
  LIMIT_TEMPLATES:                 'Достигнут лимит шаблонов',
  LIMIT_FEATURE_COMPETITORS:       'Анализ конкурентов',
  LIMIT_FEATURE_WEEKLY_PLAN:       'AI-план на неделю',
  LIMIT_FEATURE_VOICE_PROFILE:     'Голосовой профиль канала',
}
