<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useAchievementsStore } from '@/stores/useAchievementsStore'
import { ACHIEVEMENT_META } from '@/types/achievement.types'
import { useLocaleStore } from '@/stores/useLocaleStore'

const store = useAchievementsStore()
const { t } = useLocaleStore()
const visible = ref(false)
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

watch(current, (val) => {
  if (val) {
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
      setTimeout(() => store.dismissToast(), 350)
    }, 4000)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="achievement">
      <div v-if="visible && meta" class="ach-toast" @click="visible = false">
        <div class="ach-toast__emoji">{{ meta.emoji }}</div>
        <div class="ach-toast__body">
          <p class="ach-toast__label">{{ t('achievement.label') }}</p>
          <p class="ach-toast__title">{{ meta.title }}</p>
          <p class="ach-toast__desc">{{ meta.description }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
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
  padding: 14px 16px;
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

.achievement-enter-active,
.achievement-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.achievement-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.achievement-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
