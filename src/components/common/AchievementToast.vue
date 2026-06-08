<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useAchievementsStore } from '@/stores/useAchievementsStore'
import { ACHIEVEMENT_META } from '@/types/achievement.types'
import { useLocaleStore } from '@/stores/useLocaleStore'
import AchievementModal from './AchievementModal.vue'

const store = useAchievementsStore()
const { t } = useLocaleStore()
const visible = ref(false)
const showModal = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const current = computed(() => store.pendingToasts[0] ?? null)
const meta = computed(() => {
  if (!current.value) return null
  const type = current.value.type
  const base = ACHIEVEMENT_META[type]
  return {
    ...base,
    title: t(`achievement.${type}_title`),
    description: t(`achievement.${type}_desc`),
  }
})

function dismiss(): void {
  if (timer) { clearTimeout(timer); timer = null }
  visible.value = false
  setTimeout(() => store.dismissToast(), 350)
}

function openModal(): void {
  if (timer) { clearTimeout(timer); timer = null }
  visible.value = false
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
  store.dismissToast()
}

function share(): void {
  if (!current.value) return
  const title = t(`achievement.${current.value.type}_title`)
  const text = `🏆 Разблокировал достижение «${title}» в NeoPost!\n\nhttps://t.me/neoPostBot`
  if (navigator.share) {
    navigator.share({ text }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(text).catch(() => {})
  }
}

watch(current, async (val) => {
  if (!val) return
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(dismiss, 4000)

  // Confetti
  try {
    const confetti = (await import('canvas-confetti')).default
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.15 },
      colors: ['#fbbf24', '#f59e0b', '#ffffff', '#60a5fa', '#34d399'],
    })
  } catch { /* ignore if not available */ }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="achievement">
      <div v-if="visible && meta" class="ach-toast" @click="openModal">
        <div class="ach-toast__emoji">{{ meta.emoji }}</div>
        <div class="ach-toast__body">
          <p class="ach-toast__label">{{ t('achievement.label') }}</p>
          <p class="ach-toast__title">{{ meta.title }}</p>
          <p class="ach-toast__desc">{{ meta.description }}</p>
        </div>
        <button
          class="ach-toast__share"
          @click.stop="share"
        >
          🔗
        </button>
      </div>
    </Transition>
  </Teleport>

  <AchievementModal
    v-if="showModal && current"
    :achievement="current"
    @close="closeModal"
  />
</template>

<style scoped>
.ach-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px 14px 16px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  z-index: 9999;
}

.ach-toast__emoji {
  font-size: 36px;
  line-height: 1;
  flex-shrink: 0;
}

.ach-toast__body {
  min-width: 0;
  flex: 1;
}

.ach-toast__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #fbbf24;
  margin: 0 0 2px;
}

.ach-toast__title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 2px;
}

.ach-toast__desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.ach-toast__share {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(251,191,36,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.ach-toast__share:active { background: rgba(251,191,36,0.3); }

.achievement-enter-active,
.achievement-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.achievement-enter-from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
.achievement-leave-to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
</style>
