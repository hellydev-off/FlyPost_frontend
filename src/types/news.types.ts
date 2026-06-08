export type NewsCategory =
  | 'all' | 'tech' | 'general' | 'business' | 'world'
  | 'entertainment' | 'gaming' | 'science' | 'crypto' | 'sport'
  | 'music' | 'cinema' | 'fashion' | 'auto' | 'politics'
  | 'health' | 'ai' | 'startups' | 'esports' | 'culture'

export interface NewsItem {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceLabel: string
  category: NewsCategory
  imageUrl?: string
}

export interface NewsCategoryInfo {
  id: NewsCategory
  label: string
}
