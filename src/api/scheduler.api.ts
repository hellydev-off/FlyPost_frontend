import api from './index'
import { isMockMode, withDelay } from './mock'
import { mockScheduled } from './mock/mockScheduled'
import type { ScheduledPost, CreateSchedulePayload, UpdateSchedulePayload } from '@/types/scheduler.types'

export const schedulerApi = {
  async getAll(): Promise<ScheduledPost[]> {
    if (isMockMode) return withDelay(mockScheduled)
    const { data } = await api.get<ScheduledPost[]>('/api/scheduler')
    return data
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
    const { data } = await api.post<ScheduledPost>('/api/scheduler', payload)
    return data
  },

  async update(id: string, payload: UpdateSchedulePayload): Promise<ScheduledPost> {
    if (isMockMode) {
      const item = mockScheduled.find(s => s.id === id)
      if (!item) throw new Error('Schedule not found')
      return withDelay({ ...item, scheduledAt: payload.scheduledAt })
    }
    const { data } = await api.put<ScheduledPost>(`/api/scheduler/${id}`, payload)
    return data
  },

  async cancel(id: string): Promise<void> {
    if (isMockMode) return withDelay(undefined)
    await api.delete(`/api/scheduler/${id}`)
  },
}
