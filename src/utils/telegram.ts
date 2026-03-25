export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export function getTelegramUser(): TelegramUser | null {
  try {
    const tg = window.Telegram?.WebApp
    const user = tg?.initDataUnsafe?.user
    return user ?? null
  } catch {
    return null
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null
}

export function closeTelegramApp(): void {
  window.Telegram?.WebApp?.close()
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
        }
        ready(): void
        expand(): void
        close(): void
        MainButton: {
          text: string
          show(): void
          hide(): void
          onClick(cb: () => void): void
        }
        themeParams: Record<string, string>
      }
    }
  }
}
