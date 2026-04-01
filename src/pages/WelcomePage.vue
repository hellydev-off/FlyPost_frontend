<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'

const router = useRouter()

const slides = [
  {
    id: 'intro',
    emoji: '🚀',
    gradient: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)',
    accent: '#93c5fd',
    title: 'NeoPost',
    subtitle: 'Ваш AI-помощник\nдля Telegram-каналов',
    desc: 'Создавайте контент, планируйте публикации и управляйте каналами — всё в одном месте',
  },
  {
    id: 'channels',
    emoji: '📡',
    gradient: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f4c75 100%)',
    accent: '#38bdf8',
    title: 'Управляйте каналами',
    subtitle: 'Все каналы\nв одном месте',
    desc: 'Подключите свои Telegram-каналы и управляйте ими из единой панели без лишних переключений',
  },
  {
    id: 'ai',
    emoji: '✨',
    gradient: 'linear-gradient(160deg, #1a0533 0%, #4c1d95 50%, #7c3aed 100%)',
    accent: '#c4b5fd',
    title: 'AI-генерация',
    subtitle: 'Контент, который\nцепляет',
    desc: 'Генерируйте посты, улучшайте тексты и создавайте недельные планы с помощью AI одним нажатием',
  },
  {
    id: 'schedule',
    emoji: '⏱️',
    gradient: 'linear-gradient(160deg, #052e16 0%, #065f46 50%, #059669 100%)',
    accent: '#6ee7b7',
    title: 'Планировщик',
    subtitle: 'Публикуйте\nв нужное время',
    desc: 'Составляйте расписание постов заранее — они выйдут автоматически в точное время',
  },
]

const current = ref(0)
const transitioning = ref(false)

const totalSlides = slides.length
const isLast = computed(() => current.value === totalSlides - 1)

// Touch swipe
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < Math.abs(dy) || Math.abs(dx) < 40) return
  if (dx < 0) next()
  else prev()
}

function next() {
  if (transitioning.value || current.value >= totalSlides - 1) return
  transitioning.value = true
  current.value++
  setTimeout(() => { transitioning.value = false }, 400)
}

function prev() {
  if (transitioning.value || current.value <= 0) return
  transitioning.value = true
  current.value--
  setTimeout(() => { transitioning.value = false }, 400)
}

function goTo(i: number) {
  if (transitioning.value || i === current.value) return
  transitioning.value = true
  current.value = i
  setTimeout(() => { transitioning.value = false }, 400)
}
</script>

<template>
  <div
    class="welcome"
    :style="{ background: slides[current].gradient }"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Slides -->
    <div class="welcome__slides">
      <Transition name="slide" mode="out-in">
        <div :key="slides[current].id" class="welcome__slide">
          <!-- Big emoji / illustration -->
          <div class="welcome__illustration">
            <div class="welcome__blob" :style="{ background: slides[current].accent + '18' }" />
            <div class="welcome__blob welcome__blob--2" :style="{ background: slides[current].accent + '10' }" />
            <span class="welcome__emoji">{{ slides[current].emoji }}</span>
          </div>

          <!-- Text -->
          <div class="welcome__text">
            <p class="welcome__eyebrow" :style="{ color: slides[current].accent }">
              {{ slides[current].title }}
            </p>
            <h1 class="welcome__title">{{ slides[current].subtitle }}</h1>
            <p class="welcome__desc">{{ slides[current].desc }}</p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Dots -->
    <div class="welcome__dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="welcome__dot"
        :class="{ 'welcome__dot--active': i === current }"
        :style="i === current ? { background: slides[current].accent } : {}"
        @click="goTo(i)"
      />
    </div>

    <!-- Actions -->
    <div class="welcome__actions">
      <template v-if="isLast">
        <AppButton block class="welcome__btn-primary" @click="router.push({ name: 'register' })">
          Создать аккаунт
        </AppButton>
        <AppButton block variant="ghost" class="welcome__btn-ghost" @click="router.push({ name: 'login' })">
          Уже есть аккаунт
        </AppButton>
      </template>
      <template v-else>
        <AppButton block class="welcome__btn-primary" @click="next">
          Далее
        </AppButton>
        <button class="welcome__skip" @click="router.push({ name: 'login' })">
          Пропустить
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  transition: background 0.6s ease;
  overflow: hidden;
  max-width: var(--fp-max-width);
  left: 50%;
  transform: translateX(-50%);
}

/* Slides container */
.welcome__slides {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.welcome__slide {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px 0;
  gap: 32px;
}

/* Illustration area */
.welcome__illustration {
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome__blob {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(32px);
  animation: blob-pulse 4s ease-in-out infinite;
}

.welcome__blob--2 {
  width: 140px;
  height: 140px;
  top: -20px;
  right: -20px;
  animation-delay: -2s;
  animation-duration: 5s;
}

@keyframes blob-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.15) rotate(10deg); }
}

.welcome__emoji {
  font-size: 88px;
  line-height: 1;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
  animation: emoji-float 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes emoji-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

/* Text */
.welcome__text {
  text-align: center;
  max-width: 320px;
}

.welcome__eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
  opacity: 0.9;
}

.welcome__title {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 14px;
  white-space: pre-line;
}

.welcome__desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.55;
}

/* Dots */
.welcome__dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
}

.welcome__dot {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s ease, background 0.3s ease;
}

.welcome__dot--active {
  width: 24px;
}

/* Actions */
.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 24px calc(max(env(safe-area-inset-bottom), 20px) + 16px);
}

.welcome__btn-primary {
  --btn-bg: rgba(255, 255, 255, 0.18);
  --btn-bg-hover: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.18) !important;
  color: #fff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.35) !important;
  backdrop-filter: blur(8px);
  font-weight: 700;
  font-size: 16px;
}

.welcome__btn-ghost {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
}

.welcome__skip {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  padding: 8px;
  transition: color var(--fp-transition);
}

.welcome__skip:active {
  color: rgba(255, 255, 255, 0.8);
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(48px) scale(0.97);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-48px) scale(0.97);
}
</style>
