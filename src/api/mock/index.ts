export const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true'

export function withDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(data)), ms))
}
