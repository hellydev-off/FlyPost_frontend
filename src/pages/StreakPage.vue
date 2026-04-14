<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { analyticsApi } from '@/api/analytics.api'
import { useChannelsStore } from '@/stores/useChannelsStore'
import type { StreakData } from '@/types/analytics.types'

const router = useRouter()
const channelsStore = useChannelsStore()

const streak = ref<StreakData | null>(null)
const loading = ref(true)
const countVisible = ref(false)

onMounted(async () => {
  const channelId = channelsStore.selectedChannelId
  if (channelId) {
    streak.value = await analyticsApi.getStreak(channelId).catch(() => null)
  }
  loading.value = false
  setTimeout(() => { countVisible.value = true }, 100)
})

function dayLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if (n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)) return 'дня'
  return 'дней'
}
</script>

<template>
  <div class="streak-page">
    <!-- Back -->
    <button class="streak-page__back" @click="router.back()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Fire scene -->
    <div class="streak-page__scene">
      <!-- Glow rings -->
      <div class="streak-page__glow" />
      <div class="streak-page__glow streak-page__glow--2" />

      <!-- Fire SVG -->
      <div class="streak-page__fire-wrap">
        <svg class="streak-page__fire" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer flame -->
          <path
            d="M60 10 C60 10 95 35 95 75 C95 110 80 135 60 145 C40 135 25 110 25 75 C25 35 60 10 60 10Z"
            fill="url(#outerFlame)"
          />
          <!-- Mid flame -->
          <path
            d="M60 35 C60 35 85 55 85 82 C85 108 74 125 60 132 C46 125 35 108 35 82 C35 55 60 35 60 35Z"
            fill="url(#midFlame)"
          />
          <!-- Inner core -->
          <path
            d="M60 65 C60 65 75 77 75 92 C75 108 68 118 60 122 C52 118 45 108 45 92 C45 77 60 65 60 65Z"
            fill="url(#innerFlame)"
          />
          <!-- Sparkles -->
          <circle class="spark spark--1" cx="42" cy="50" r="3" fill="#FCD34D" opacity="0.8"/>
          <circle class="spark spark--2" cx="80" cy="40" r="2" fill="#FDE68A" opacity="0.7"/>
          <circle class="spark spark--3" cx="35" cy="70" r="2.5" fill="#FCD34D" opacity="0.6"/>
          <circle class="spark spark--4" cx="88" cy="65" r="2" fill="#FDE68A" opacity="0.75"/>
          <circle class="spark spark--5" cx="55" cy="25" r="1.5" fill="#FEF3C7" opacity="0.9"/>
          <defs>
            <linearGradient id="outerFlame" x1="60" y1="10" x2="60" y2="145" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FEF3C7"/>
              <stop offset="30%" stop-color="#FCD34D"/>
              <stop offset="65%" stop-color="#F97316"/>
              <stop offset="100%" stop-color="#DC2626" stop-opacity="0.6"/>
            </linearGradient>
            <linearGradient id="midFlame" x1="60" y1="35" x2="60" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FDE68A"/>
              <stop offset="40%" stop-color="#F59E0B"/>
              <stop offset="100%" stop-color="#EA580C" stop-opacity="0.7"/>
            </linearGradient>
            <linearGradient id="innerFlame" x1="60" y1="65" x2="60" y2="122" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FEF9C3"/>
              <stop offset="50%" stop-color="#FDE047"/>
              <stop offset="100%" stop-color="#F59E0B"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Count -->
      <div class="streak-page__count-wrap" :class="{ 'streak-page__count-wrap--visible': countVisible }">
        <span class="streak-page__count">{{ streak?.streak ?? 0 }}</span>
        <span class="streak-page__days">{{ dayLabel(streak?.streak ?? 0) }} подряд</span>
      </div>
    </div>

    <!-- Info block -->
    <div class="streak-page__info">
      <h2 class="streak-page__title">
        {{ (streak?.streak ?? 0) > 0 ? 'Серия активна 🔥' : 'Начни свою серию' }}
      </h2>
      <p class="streak-page__subtitle">
        {{ (streak?.streak ?? 0) > 0
          ? `Ты публикуешь ${streak!.streak} ${dayLabel(streak!.streak)} подряд. Не прерывай серию!`
          : 'Публикуй хотя бы один пост в день, чтобы зажечь огонь'
        }}
      </p>

      <!-- Tips -->
      <ul class="streak-page__tips">
        <li class="streak-page__tip">
          <div class="streak-page__tip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="streak-page__tip-title">Публикуй каждый день</p>
            <p class="streak-page__tip-desc">Хотя бы один пост в день сохраняет серию</p>
          </div>
        </li>
        <li class="streak-page__tip">
          <div class="streak-page__tip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p class="streak-page__tip-title">Используй AI</p>
            <p class="streak-page__tip-desc">Генерируй тексты быстро, чтобы не пропускать дни</p>
          </div>
        </li>
        <li class="streak-page__tip">
          <div class="streak-page__tip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" fill="none"/>
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="streak-page__tip-title">Планируй заранее</p>
            <p class="streak-page__tip-desc">Запланированные посты тоже засчитываются в серию</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.streak-page {
  min-height: 100dvh;
  background: linear-gradient(180deg, #1c0a00 0%, #3d1500 40%, var(--fp-bg) 75%);
  display: flex;
  flex-direction: column;
  padding-bottom: calc(max(env(safe-area-inset-bottom), 20px) + 16px);
}

/* Back */
.streak-page__back {
  position: absolute;
  top: max(env(safe-area-inset-top), 16px);
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}
.streak-page__back:active { transform: scale(0.9); }

/* Scene */
.streak-page__scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: max(env(safe-area-inset-top), 16px);
  padding-top: calc(max(env(safe-area-inset-top), 16px) + 60px);
  position: relative;
}

/* Glow */
.streak-page__glow {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(234,88,12,0.15) 50%, transparent 75%);
  animation: glow-pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}

.streak-page__glow--2 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(253,224,71,0.25) 0%, transparent 70%);
  animation-delay: -1.2s;
  animation-duration: 2s;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.6; transform: translateX(-50%) scale(1.12); }
}

/* Fire */
.streak-page__fire-wrap {
  width: 160px;
  height: 200px;
  position: relative;
  z-index: 1;
  animation: fire-sway 3s ease-in-out infinite;
}

.streak-page__fire {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 24px rgba(251,146,60,0.7)) drop-shadow(0 0 48px rgba(234,88,12,0.4));
}

@keyframes fire-sway {
  0%, 100% { transform: scaleX(1) rotate(-1deg); }
  33% { transform: scaleX(1.04) rotate(1.5deg); }
  66% { transform: scaleX(0.97) rotate(-0.5deg); }
}

/* Sparks */
.spark {
  animation: spark-float 2s ease-in-out infinite;
}
.spark--1 { animation-duration: 2.1s; animation-delay: 0s; }
.spark--2 { animation-duration: 1.8s; animation-delay: -0.6s; }
.spark--3 { animation-duration: 2.4s; animation-delay: -1.1s; }
.spark--4 { animation-duration: 1.6s; animation-delay: -0.3s; }
.spark--5 { animation-duration: 2.2s; animation-delay: -1.5s; }

@keyframes spark-float {
  0% { opacity: 0.8; transform: translateY(0) scale(1); }
  50% { opacity: 1; transform: translateY(-8px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-20px) scale(0.5); }
}

/* Count */
.streak-page__count-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
  opacity: 0;
  transform: translateY(16px) scale(0.85);
  transition: opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.streak-page__count-wrap--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.streak-page__count {
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  color: #fff;
  letter-spacing: -2px;
  text-shadow: 0 0 40px rgba(251,146,60,0.8), 0 4px 16px rgba(0,0,0,0.4);
}

.streak-page__days {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

/* Info */
.streak-page__info {
  flex: 1;
  background: var(--fp-bg);
  border-radius: 28px 28px 0 0;
  padding: 28px 20px 0;
  margin-top: 32px;
}

.streak-page__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--fp-text);
  margin-bottom: 8px;
}

.streak-page__subtitle {
  font-size: 14px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

/* Tips */
.streak-page__tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.streak-page__tip {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: 14px;
}

.streak-page__tip-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(234,88,12,0.08));
  color: #F97316;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.streak-page__tip-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 2px;
}

.streak-page__tip-desc {
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.4;
}
</style>
