<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToastStore } from '@/stores/useToastStore'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit(): Promise<void> {
  if (!email.value.trim()) {
    toast.show('Введите email', 'error')
    return
  }
  if (!password.value) {
    toast.show('Введите пароль', 'error')
    return
  }

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.replace({ name: 'home' })
  } catch {
    // toast shown by store
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__header">
      <button class="auth-page__back" @click="router.back()">
        <AppIcon name="arrow-left" :size="22" />
      </button>
      <h1>Вход</h1>
    </div>

    <form class="auth-page__form stagger" @submit.prevent="onSubmit">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="example@mail.com"
      />
      <AppInput
        v-model="password"
        label="Пароль"
        type="password"
        placeholder="Ваш пароль"
      />

      <AppButton block :loading="loading" class="auth-page__submit">
        Войти
      </AppButton>
    </form>

    <p class="auth-page__footer">
      Нет аккаунта?
      <a class="auth-page__link" @click="router.replace({ name: 'register' })">Зарегистрироваться</a>
    </p>
  </div>
</template>

<style scoped>
.auth-page {
  padding-top: 16px;
}

.auth-page__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
}

.auth-page__header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.auth-page__back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fp-transition);
}

.auth-page__back:active {
  transform: scale(0.9);
  background: var(--fp-bg-tertiary);
}

.auth-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-page__submit {
  margin-top: 8px;
}

.auth-page__footer {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.auth-page__link {
  color: var(--fp-primary);
  font-weight: 600;
  cursor: pointer;
}
</style>
