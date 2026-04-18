import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type AuthResponse } from '@/api/auth.api'
import { profileApi } from '@/api/profile.api'
import { useToastStore } from './useToastStore'
import { useLocaleStore } from './useLocaleStore'

export interface AppUser {
  id: string
  firstName: string
  username: string | null
  telegramId: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('fp_token'))
  const isLoading = ref(false)
  const avatarUrl = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function applyResult(result: AuthResponse): void {
    token.value = result.token
    localStorage.setItem('fp_token', result.token)
    user.value = {
      id: result.user.id,
      firstName: result.user.firstName,
      username: result.user.username,
      telegramId: result.user.telegramId,
    }
    localStorage.setItem('fp_user', JSON.stringify(user.value))
    fetchAvatar()
  }

  async function fetchAvatar(): Promise<void> {
    if (!user.value?.telegramId) return
    avatarUrl.value = await profileApi.getPhoto()
  }

  async function telegramLogin(initData: string): Promise<void> {
    isLoading.value = true
    try {
      const result = await authApi.telegram(initData)
      applyResult(result)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? useLocaleStore().t('stores.auth.telegramError')
      useToastStore().show(message, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function devLogin(username: string): Promise<void> {
    isLoading.value = true
    try {
      const result = await authApi.devLogin(username)
      applyResult(result)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? useLocaleStore().t('stores.auth.userNotFound')
      useToastStore().show(message, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function restoreSession(): void {
    const savedUser = localStorage.getItem('fp_user')
    if (token.value && savedUser) {
      try {
        user.value = JSON.parse(savedUser) as AppUser
        fetchAvatar()
      } catch {
        logout()
      }
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    avatarUrl.value = null
    localStorage.removeItem('fp_token')
    localStorage.removeItem('fp_user')
  }

  return { user, token, avatarUrl, isAuthenticated, isLoading, telegramLogin, devLogin, restoreSession, logout }
})
