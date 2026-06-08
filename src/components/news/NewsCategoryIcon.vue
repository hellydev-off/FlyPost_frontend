<script setup lang="ts">
import type { NewsCategory } from '@/types/news.types'

const props = defineProps<{ category: NewsCategory; size?: number }>()

// stroke-based Lucide-style paths, 24x24 viewBox
const PATHS: Record<NewsCategory, string> = {
  all: `
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>`,

  tech: `
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>`,

  ai: `
    <rect x="7" y="7" width="10" height="10" rx="1.5"/>
    <path d="M7 9.5H3.5M7 12H3.5M7 14.5H3.5"/>
    <path d="M17 9.5h3.5M17 12h3.5M17 14.5h3.5"/>
    <path d="M9.5 7V3.5M12 7V3.5M14.5 7V3.5"/>
    <path d="M9.5 17v3.5M12 17v3.5M14.5 17v3.5"/>`,

  general: `
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>`,

  business: `
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>`,

  startups: `
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`,

  world: `
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>`,

  politics: `
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>`,

  entertainment: `
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,

  music: `
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>`,

  cinema: `
    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>`,

  gaming: `
    <line x1="6" y1="12" x2="10" y2="12"/>
    <line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="18" y1="11" x2="18.01" y2="11" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>`,

  esports: `
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>`,

  sport: `
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,

  science: `
    <path d="M10 2v8L4 19a2 2 0 001.8 3h12.4A2 2 0 0020 19L14 10V2"/>
    <path d="M8.5 2h7"/>
    <path d="M7 16h10"/>`,

  health: `
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>`,

  crypto: `
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 8h4.5a2 2 0 010 4H9m0 0h5a2 2 0 010 4H9M9 8v8"/>
    <line x1="10.5" y1="8" x2="10.5" y2="6.5"/>
    <line x1="10.5" y1="16" x2="10.5" y2="17.5"/>`,

  fashion: `
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>`,

  auto: `
    <path d="M5 17H3a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/>
    <circle cx="17" cy="17" r="2"/>
    <path d="M5 8l1.6-4h10.8L19 8"/>`,

  culture: `
    <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,
}
</script>

<template>
  <svg
    :width="props.size ?? 22"
    :height="props.size ?? 22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="PATHS[props.category]"
  />
</template>
