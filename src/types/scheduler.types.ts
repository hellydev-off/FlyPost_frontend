export type ScheduleStatus = 'pending' | 'sent' | 'failed'

export interface ScheduledPost {
  id: string
  postId: string
  channelId: string
  content: string
  scheduledAt: string
  status: ScheduleStatus
  createdAt: string
}

export interface CreateSchedulePayload {
  postId: string
  scheduledAt: string
}

export interface UpdateSchedulePayload {
  scheduledAt: string
}
