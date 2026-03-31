import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('fp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fp_token')
      window.location.reload()
    }
    if (error.response?.status === 402) {
      // Lazy import to avoid circular deps
      import('@/stores/usePlanStore').then(({ usePlanStore }) => {
        const limitCode = error.response?.data?.error ?? 'LIMIT_UNKNOWN'
        usePlanStore().showPaywall(limitCode)
      })
    }
    return Promise.reject(error)
  },
)

export default api
