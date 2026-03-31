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
}
