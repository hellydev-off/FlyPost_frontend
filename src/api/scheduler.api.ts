import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockScheduled } from './mock/mockScheduled'
import type { ScheduledPost, CreateSchedulePayload, UpdateSchedulePayload } from '@/types/scheduler.types'

interface RawScheduledPost {
  id: string
  post: {
    id: string
    content: string
    channel?: { id: string }
  }
  scheduledAt: string
  status: string
  jobId?: string | null
}

function mapScheduled(raw: RawScheduledPost): ScheduledPost {
  return {
    id: raw.id,
    postId: raw.post.id,
    channelId: raw.post.channel?.id ?? '',
    content: raw.post.content,
    scheduledAt: raw.scheduledAt,
    status: raw.status as ScheduledPost['status'],
    createdAt: raw.scheduledAt,
  }
}

export const schedulerApi = {
  async getAll(): Promise<ScheduledPost[]> {
    if (isMockMode) return withDelay(mockScheduled)
    const { data } = await api.get<RawScheduledPost[]>('/api/scheduler')
    return data.map(mapScheduled)
  },

  async schedule(payload: CreateSchedulePayload): Promise<ScheduledPost> {
    if (isMockMode) {
      const newSchedule: ScheduledPost = {
        id: String(Date.now()),
        postId: payload.postId,
        channelId: '1',
        content: 'Запланированный пост',
        scheduledAt: payload.scheduledAt,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      return withDelay(newSchedule)
    }
    const { data } = await api.post<RawScheduledPost>('/api/scheduler', payload)
    return mapScheduled(data)
  },

  async update(id: string, payload: UpdateSchedulePayload): Promise<ScheduledPost> {
    if (isMockMode) {
      const item = mockScheduled.find(s => s.id === id)
      if (!item) throw new Error('Schedule not found')
      return withDelay({ ...item, scheduledAt: payload.scheduledAt })
    }
    const { data } = await api.put<RawScheduledPost>(`/api/scheduler/${id}`, payload)
    return mapScheduled(data)
  },

  async cancel(id: string): Promise<void> {
    if (isMockMode) return withDelay(undefined)
    await api.delete(`/api/scheduler/${id}`)
  },
}
