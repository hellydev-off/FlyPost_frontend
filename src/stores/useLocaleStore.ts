import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ru from '@/i18n/ru'
import en from '@/i18n/en'

export type Locale = 'ru' | 'en'

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] }
type Messages = typeof ru

const STORAGE_KEY = 'fp_locale'

const locales: Record<Locale, Messages> = { ru, en }

export const useLocaleStore = defineStore('locale', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const locale = ref<Locale>(stored === 'en' ? 'en' : 'ru')

  const messages = computed(() => locales[locale.value] ?? locales.ru)

  function setLocale(l: Locale): void {
    locale.value = l
    localStorage.setItem(STORAGE_KEY, l)
  }

  function t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = messages.value
    for (const key of keys) {
      if (node == null || typeof node !== 'object') return path
      node = node[key]
    }
    let result = typeof node === 'string' ? node : path
    if (params) {
      for (const [key, val] of Object.entries(params)) {
        result = result.replace(`{${key}}`, String(val))
      }
    }
    return result
  }

  return { locale, messages, setLocale, t }
})
