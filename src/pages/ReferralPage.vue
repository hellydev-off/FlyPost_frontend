<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReferralStore } from '@/stores/useReferralStore'
import { useToastStore } from '@/stores/useToastStore'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const store = useReferralStore()
const toast = useToastStore()

onMounted(() => store.fetchStats())

function shareText(): string {
  const link = store.stats?.referralLink ?? ''
  return `Использую NeoPost для своего Telegram-канала —\nAI пишет посты, я только публикую 😄\nПопробуй 14 дней бесплатно:\n${link}`
}

async function copyLink(): Promise<void> {
  const link = store.stats?.referralLink ?? ''
  try {
    await navigator.clipboard.writeText(link)
    toast.show('Ссылка скопирована!', 'success')
  } catch {
    toast.show('Не удалось скопировать', 'error')
  }
}

function shareLink(): void {
  const text = shareText()
  if (navigator.share) {
    navigator.share({ text }).catch(() => {})
  } else {
    copyLink()
  }
}

function progressWidth(): number {
  if (!store.stats) return 0
  const { count, nextTierReferrals } = store.stats
  if (!nextTierReferrals) return 100
  const total = count + nextTierReferrals
  return Math.round((count / total) * 100)
}
</script>

<template>
  <div class="ref-page">
    <div class="ref-page__header">
      <button class="ref-page__back" @click="router.back()">
        <AppIcon name="arrow-left" :size="20" />
      </button>
      <h1 class="ref-page__title">Пригласить друга</h1>
    </div>

    <div v-if="store.loading" class="ref-page__loading">
      <div class="ref-page__spinner" />
    </div>

    <div v-else-if="store.error" class="ref-page__error">
      <p>Не удалось загрузить данные</p>
      <button class="ref-page__retry" @click="store.fetchStats()">Повторить</button>
    </div>

    <template v-else-if="store.stats">
      <!-- Hero -->
      <div class="ref-page__hero">
        <div class="ref-page__hero-emoji">🎁</div>
        <h2 class="ref-page__hero-title">Зовите друзей — получайте PRO</h2>
        <p class="ref-page__hero-desc">
          1 друг = +7 дней PRO · 3 друга = +30 дней PRO
        </p>
      </div>

      <!-- Stats card -->
      <div class="ref-page__card">
        <div class="ref-page__stat">
          <span class="ref-page__stat-value">{{ store.stats.count }}</span>
          <span class="ref-page__stat-label">Приглашено</span>
        </div>
        <div class="ref-page__divider" />
        <div class="ref-page__stat">
          <span class="ref-page__stat-value">{{ store.stats.bonusDays }}</span>
          <span class="ref-page__stat-label">Бонусных дней</span>
        </div>
      </div>

      <!-- Progress to next tier -->
      <div v-if="store.stats.nextTierReferrals !== null" class="ref-page__progress-block">
        <p class="ref-page__progress-label">
          Ещё {{ store.stats.nextTierReferrals }} {{ store.stats.nextTierReferrals === 1 ? 'приглашение' : 'приглашений' }}
          = +{{ store.stats.nextTierBonus }} дней PRO
        </p>
        <div class="ref-page__progress-bar">
          <div class="ref-page__progress-fill" :style="{ width: progressWidth() + '%' }" />
        </div>
      </div>

      <!-- Link block -->
      <div class="ref-page__link-block">
        <p class="ref-page__link-label">Ваша ссылка</p>
        <div class="ref-page__link-row">
          <span class="ref-page__link-text">{{ store.stats.referralLink }}</span>
          <button class="ref-page__copy-btn" @click="copyLink">
            <AppIcon name="draft" :size="16" />
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="ref-page__actions">
        <button class="ref-page__btn ref-page__btn--primary" @click="shareLink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
          Поделиться ссылкой
        </button>
        <button class="ref-page__btn ref-page__btn--secondary" @click="copyLink">
          Скопировать ссылку
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ref-page {
  max-width: var(--fp-max-width);
  margin: 0 auto;
  padding: var(--fp-tg-header-height) var(--fp-spacing) calc(var(--fp-bottom-nav-height) + 20px);
}

.ref-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.ref-page__back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text);
  flex-shrink: 0;
}

.ref-page__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text);
}

.ref-page__loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.ref-page__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--fp-border);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ref-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: var(--fp-text-secondary);
  text-align: center;
  font-size: 15px;
}

.ref-page__retry {
  padding: 10px 24px;
  border-radius: 20px;
  background: var(--fp-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.ref-page__hero {
  text-align: center;
  padding: 24px 0 20px;
}

.ref-page__hero-emoji {
  font-size: 56px;
  line-height: 1;
  margin-bottom: 16px;
}

.ref-page__hero-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text);
  margin: 0 0 8px;
}

.ref-page__hero-desc {
  font-size: 14px;
  color: var(--fp-text-secondary);
  margin: 0;
}

.ref-page__card {
  display: flex;
  align-items: center;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border: 1px solid var(--fp-border);
  padding: 20px;
  margin: 16px 0;
}

.ref-page__stat {
  flex: 1;
  text-align: center;
}

.ref-page__stat-value {
  display: block;
  font-size: 36px;
  font-weight: 800;
  color: var(--fp-primary);
  line-height: 1;
}

.ref-page__stat-label {
  display: block;
  font-size: 12px;
  color: var(--fp-text-secondary);
  margin-top: 4px;
}

.ref-page__divider {
  width: 1px;
  height: 48px;
  background: var(--fp-border);
  flex-shrink: 0;
}

.ref-page__progress-block {
  margin-bottom: 20px;
}

.ref-page__progress-label {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin: 0 0 8px;
}

.ref-page__progress-bar {
  height: 6px;
  background: var(--fp-border);
  border-radius: 3px;
  overflow: hidden;
}

.ref-page__progress-fill {
  height: 100%;
  background: var(--fp-primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ref-page__link-block {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  border: 1px solid var(--fp-border);
  padding: 14px;
  margin-bottom: 16px;
}

.ref-page__link-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 6px;
}

.ref-page__link-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ref-page__link-text {
  flex: 1;
  font-size: 13px;
  color: var(--fp-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ref-page__copy-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ref-page__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ref-page__btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
}
.ref-page__btn:active { opacity: 0.8; }

.ref-page__btn--primary {
  background: var(--fp-primary);
  color: #fff;
}

.ref-page__btn--secondary {
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  border: 1.5px solid var(--fp-border);
}
</style>
