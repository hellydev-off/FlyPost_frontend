import api from './index'
import { isMockMode, withDelay } from './mock'
import type { ReferralStats } from '@/types/referral.types'

export const referralApi = {
  async getStats(): Promise<ReferralStats> {
    if (isMockMode) {
      return withDelay<ReferralStats>({
        referralCode: 'DEMO1234',
        referralLink: 'https://t.me/neoPostBot?start=ref_DEMO1234',
        count: 2,
        bonusDays: 7,
        nextTierReferrals: 1,
        nextTierBonus: 30,
      })
    }
    const { data } = await api.get<{ data: ReferralStats }>('/api/referrals')
    return data.data
  },
}
