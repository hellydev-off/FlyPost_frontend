export interface ReferralStats {
  referralCode: string
  referralLink: string
  count: number
  bonusDays: number
  nextTierReferrals: number | null
  nextTierBonus: number | null
}
