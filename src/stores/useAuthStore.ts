import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTelegramUser, getTelegramWebApp, type TelegramUser } from '@/utils/telegram'
import { authApi } from '@/api/auth.api'
import { isMockMode } from '@/api/mock'

const DEV_USER: TelegramUser = {
  id: 100001,
  first_name: 'Dev User',
  username: 'devuser',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<TelegramUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('fp_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function initFromTelegram(): Promise<void> {
    isLoading.value = true
    try {
      if (isMockMode) {
        user.value = getTelegramUser() ?? DEV_USER
        return
      }

      const tgWebApp = getTelegramWebApp()
      const tgUser = getTelegramUser()
      const initData = tgWebApp?.initData

      if (initData) {
        // Реальный Telegram Mini App: валидируем через бэкенд
        const result = await authApi.telegram(initData)
        setToken(result.token)
        user.value = tgUser ?? {
          id: parseInt(result.user.telegramId),
          first_name: result.user.firstName,
          username: result.user.username ?? undefined,
        }
      } else {
        // Браузер / dev режим: dev-login через бэкенд
        const devUser = tgUser ?? DEV_USER
        const result = await authApi.devLogin(devUser)
        setToken(result.token)
        user.value = devUser
      }
    } catch (err) {
      console.error('[Auth] Init failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  function setToken(jwt: string): void {
    token.value = jwt
    localStorage.setItem('fp_token', jwt)
  }

  function logout(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('fp_token')
  }

  return { user, token, isAuthenticated, isLoading, initFromTelegram, setToken, logout }
})
