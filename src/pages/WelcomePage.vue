<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()

const features = [
  { icon: 'channels', title: 'Каналы', desc: 'Подключите свои Telegram-каналы' },
  { icon: 'sparkles', title: 'AI-посты', desc: 'Генерируйте контент с помощью AI' },
  { icon: 'calendar', title: 'Планировщик', desc: 'Планируйте публикации по расписанию' },
]
</script>

<template>
  <div class="welcome">
    <div class="welcome__hero stagger">
      <div class="welcome__logo">
        <AppIcon name="rocket" :size="32" color="#fff" />
      </div>
      <h1 class="welcome__title">FlyPost</h1>
      <p class="welcome__subtitle">
        Управляйте Telegram-каналами, создавайте и планируйте посты с помощью AI
      </p>
    </div>

    <div class="welcome__features stagger">
      <div v-for="(f, i) in features" :key="i" class="welcome__feature">
        <span class="welcome__feature-icon">
          <AppIcon :name="f.icon" :size="20" />
        </span>
        <div>
          <strong>{{ f.title }}</strong>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </div>

    <div class="welcome__actions">
      <AppButton block @click="router.push({ name: 'register' })">
        Создать аккаунт
      </AppButton>
      <AppButton block variant="secondary" @click="router.push({ name: 'login' })">
        Уже есть аккаунт
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--fp-spacing) * 2);
  padding-bottom: 0;
}

.welcome__hero {
  text-align: center;
  padding: 48px 0 32px;
}

.welcome__logo {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.welcome__title {
  font-size: 32px;
  font-weight: 800;
  color: var(--fp-text);
  margin-bottom: 8px;
}

.welcome__subtitle {
  font-size: 15px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

.welcome__features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
}

.welcome__feature {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  transition: all var(--fp-transition);
}

.welcome__feature:active {
  transform: scale(0.98);
}

.welcome__feature-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome__feature strong {
  font-size: 15px;
  display: block;
  margin-bottom: 2px;
  color: var(--fp-text);
}

.welcome__feature p {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin: 0;
}

.welcome__actions {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
  padding-bottom: 24px;
}
</style>
