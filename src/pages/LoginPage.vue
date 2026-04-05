<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { getTelegramWebApp } from '@/utils/telegram'
import { useLocaleStore } from '@/stores/useLocaleStore'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useLocaleStore()

const isDev = import.meta.env.DEV
const username = ref('')
const loading = ref(false)
const autoLoginFailed = ref(false)

onMounted(async () => {
  const tg = getTelegramWebApp()
  if (tg?.initData) {
    // Запущены в Telegram Mini App — авто-вход
    tg.ready()
    loading.value = true
    try {
      await auth.telegramLogin(tg.initData)
      router.replace({ name: 'home' })
    } catch {
      autoLoginFailed.value = true
    } finally {
      loading.value = false
    }
  }
})

async function onDevLogin(): Promise<void> {
  if (!username.value.trim()) return
  loading.value = true
  try {
    await auth.devLogin(username.value.trim())
    router.replace({ name: 'home' })
  } catch {
    // toast shown by store
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <!-- Auto-login spinner (Telegram context) -->
    <div v-if="loading && !isDev" class="login__splash">
      <div class="login__spinner" />
      <p>{{ t('login.loading') }}</p>
    </div>

    <!-- Ошибка авто-входа в Telegram -->
    <div v-else-if="autoLoginFailed" class="login__error">
      <AppIcon name="alert-circle" :size="48" color="var(--fp-danger)" />
      <h2>{{ t('login.errorTitle') }}</h2>
      <p>{{ t('login.errorDesc') }}</p>
    </div>

    <!-- Dev режим: форма ввода username -->
    <div v-else-if="isDev" class="login__dev">
      <div class="login__dev-badge">DEV MODE</div>
      <div class="login__icon">
        <AppIcon name="bot" :size="40" color="var(--fp-primary)" />
      </div>
      <h1>{{ t('login.devTitle') }}</h1>
      <p class="login__hint">
        {{ t('login.devHint') }} <code>seed:dev</code>
      </p>

      <form class="login__form" @submit.prevent="onDevLogin">
        <AppInput
          v-model="username"
          label="Username"
          placeholder="devuser"
          :autofocus="true"
        />
        <AppButton block :loading="loading" class="login__submit">
          {{ t('login.submit') }}
        </AppButton>
      </form>
    </div>

    <!-- Production без Telegram -->
    <div v-else class="login__tg-only">
      <span class="login__tg-icon">✈️</span>
      <h2>{{ t('login.openTitle') }}</h2>
      <p>{{ t('login.openDesc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Spinner */
.login__splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--fp-text-secondary);
  font-size: 14px;
}

.login__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--fp-bg-secondary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.login__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 300px;
}

.login__error h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text);
}

.login__error p {
  font-size: 14px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

/* Dev form */
.login__dev {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.login__dev-badge {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--fp-primary);
  background: var(--fp-primary-bg);
  padding: 4px 10px;
  border-radius: 20px;
}

.login__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login__dev h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--fp-text);
  text-align: center;
}

.login__hint {
  font-size: 13px;
  color: var(--fp-text-secondary);
  text-align: center;
}

.login__hint code {
  background: var(--fp-bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--fp-primary);
}

.login__form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}

.login__submit {
  margin-top: 4px;
}

/* TG only */
.login__tg-only {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 280px;
}

.login__tg-icon {
  font-size: 56px;
}

.login__tg-only h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text);
}

.login__tg-only p {
  font-size: 14px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}
</style>
