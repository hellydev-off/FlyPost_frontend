import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fp_theme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(getInitialTheme())

  function getInitialTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return 'light'
  }

  function apply(t: Theme): void {
    document.documentElement.setAttribute('data-theme', t)
  }

  function setTheme(t: Theme): void {
    theme.value = t
    localStorage.setItem(STORAGE_KEY, t)
    apply(t)
  }

  function toggle(): void {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function init(): void {
    apply(theme.value)
  }

  return { theme, setTheme, toggle, init }
})
