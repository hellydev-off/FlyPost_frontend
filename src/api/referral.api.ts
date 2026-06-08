import api from './index'
import type { ReferralStats } from '@/types/referral.types'

export const referralApi = {
  async getStats(): Promise<ReferralStats> {
    const { data } = await api.get<{ data: ReferralStats }>('/api/referrals')
    return data.data
  },
}
