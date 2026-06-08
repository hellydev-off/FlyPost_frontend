import { defineStore } from 'pinia'
import { ref } from 'vue'
import { newsApi } from '@/api/news.api'
import type { NewsItem, NewsCategory } from '@/types/news.types'

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeCategory = ref<NewsCategory>('all')
  const lastFetchedCategory = ref<NewsCategory | null>(null)

  async function fetchNews(category: NewsCategory = activeCategory.value): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      items.value = await newsApi.getNews(category, 40)
      lastFetchedCategory.value = category
    } catch {
      error.value = 'Не удалось загрузить новости'
    } finally {
      loading.value = false
    }
  }

  async function setCategory(category: NewsCategory): Promise<void> {
    activeCategory.value = category
    await fetchNews(category)
  }

  async function refresh(): Promise<void> {
    await fetchNews(activeCategory.value)
  }

  return { items, loading, error, activeCategory, fetchNews, setCategory, refresh }
})
