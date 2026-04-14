export interface Competitor {
  id: string
  channelUsername: string
  title: string
  lastAnalysis: string | null
  analyzedAt: string | null
  createdAt: string
}

export interface CompetitorAnalysis {
  memberCount: number
  insights: string
}

export interface WeeklyPlanIdea {
  title: string
  summary: string
  suggestedHour: number
  dayIndex: number  // 0=Пн … 6=Вс
}

export interface DailyPlanIdea {
  title: string
  summary: string
  scheduledTime: string // "09:00"
}

export interface AiPlan {
  id: string
  channelId: string
  type: 'daily' | 'weekly'
  ideas: (DailyPlanIdea | WeeklyPlanIdea)[]
  warning: string | null
  createdAt: string
}
