import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type AuthResponse } from '@/api/auth.api'
import { useToastStore } from './useToastStore'

export interface AppUser {
  id: string
  firstName: string
  email: string | null
  username: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null)
  const token = ref<string | null>(localStorage.getItem('fp_token'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function applyResult(result: AuthResponse): void {
    token.value = result.token
    localStorage.setItem('fp_token', result.token)
    user.value = {
      id: result.user.id,
      firstName: result.user.firstName,
      email: result.user.email,
      username: result.user.username,
    }
    localStorage.setItem('fp_user', JSON.stringify(user.value))
  }

  async function register(email: string, password: string, firstName: string): Promise<void> {
    isLoading.value = true
    try {
      const result = await authApi.register(email, password, firstName)
      applyResult(result)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Ошибка регистрации'
      useToastStore().show(message, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    try {
      const result = await authApi.login(email, password)
      applyResult(result)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Неверный email или пароль'
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
      } catch {
        logout()
      }
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('fp_token')
    localStorage.removeItem('fp_user')
  }

  return { user, token, isAuthenticated, isLoading, register, login, restoreSession, logout }
})
