<script setup lang="ts">
import type { Achievement } from '@/types/achievement.types'
import { ACHIEVEMENT_META } from '@/types/achievement.types'
import { useLocaleStore } from '@/stores/useLocaleStore'

const props = defineProps<{ achievement: Achievement }>()
const emit = defineEmits<{ 'close': [] }>()

const { t } = useLocaleStore()
const meta = ACHIEVEMENT_META[props.achievement.type]

function share(): void {
  const text = `🏆 Разблокировал достижение «${t(`achievement.${props.achievement.type}_title`)}» в NeoPost!\n\nhttps://t.me/neoPostBot`
  if (navigator.share) {
    navigator.share({ text }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(text).catch(() => {})
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="ach-modal-overlay" @click="emit('close')" />
    <div class="ach-modal">
      <div class="ach-modal__handle" />
      <div class="ach-modal__emoji">{{ meta.emoji }}</div>
      <p class="ach-modal__label">{{ t('achievement.label') }}</p>
      <h2 class="ach-modal__title">{{ t(`achievement.${props.achievement.type}_title`) }}</h2>
      <p class="ach-modal__desc">{{ t(`achievement.${props.achievement.type}_desc`) }}</p>
      <div class="ach-modal__actions">
        <button class="ach-modal__share" @click="share">
          🔗 {{ t('achievement.share') }}
        </button>
        <button class="ach-modal__close" @click="emit('close')">
          {{ t('achievement.close') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ach-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 9998;
}

.ach-modal {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  background: linear-gradient(160deg, #1e293b, #0f172a);
  border-radius: 20px 20px 0 0;
  padding: 12px 20px calc(max(env(safe-area-inset-bottom), 16px) + 16px);
  z-index: 9999;
  text-align: center;
}

.ach-modal__handle {
  width: 36px;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  margin: 0 auto 24px;
}

.ach-modal__emoji {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 16px;
}

.ach-modal__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #fbbf24;
  margin: 0 0 8px;
}

.ach-modal__title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
}

.ach-modal__desc {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
  margin: 0 0 28px;
}

.ach-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ach-modal__share {
  padding: 13px;
  border-radius: 12px;
  background: rgba(251,191,36,0.15);
  border: 1.5px solid rgba(251,191,36,0.3);
  color: #fbbf24;
  font-size: 14px;
  font-weight: 600;
}
.ach-modal__share:active { opacity: 0.7; }

.ach-modal__close {
  padding: 13px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  font-weight: 500;
}
.ach-modal__close:active { opacity: 0.7; }
</style>
