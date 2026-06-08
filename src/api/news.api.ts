import api from './index'
import type { NewsItem, NewsCategory, NewsCategoryInfo } from '@/types/news.types'

export const newsApi = {
  async getNews(category: NewsCategory = 'all', limit = 30): Promise<NewsItem[]> {
    const { data } = await api.get<{ data: NewsItem[] }>('/api/news', { params: { category, limit } })
    return data.data
  },

  async getCategories(): Promise<NewsCategoryInfo[]> {
    const { data } = await api.get<{ data: NewsCategoryInfo[] }>('/api/news/categories')
    return data.data
  },
}
