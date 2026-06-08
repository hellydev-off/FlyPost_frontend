<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/useNewsStore'
import AppIcon from '@/components/common/AppIcon.vue'
import NewsCategoryIcon from '@/components/news/NewsCategoryIcon.vue'
import type { NewsItem, NewsCategory } from '@/types/news.types'

const store = useNewsStore()
const router = useRouter()

const showFilterSheet = ref(false)

const CATEGORIES: Array<{ id: NewsCategory; label: string }> = [
  { id: 'all',           label: 'Все'        },
  { id: 'tech',          label: 'Технологии' },
  { id: 'ai',            label: 'ИИ'         },
  { id: 'general',       label: 'Новости'    },
  { id: 'business',      label: 'Бизнес'     },
  { id: 'startups',      label: 'Стартапы'   },
  { id: 'world',         label: 'Мир'        },
  { id: 'politics',      label: 'Политика'   },
  { id: 'entertainment', label: 'Звёзды'     },
  { id: 'music',         label: 'Музыка'     },
  { id: 'cinema',        label: 'Кино'       },
  { id: 'gaming',        label: 'Игры'       },
  { id: 'esports',       label: 'Киберспорт' },
  { id: 'sport',         label: 'Спорт'      },
  { id: 'science',       label: 'Наука'      },
  { id: 'health',        label: 'Здоровье'   },
  { id: 'crypto',        label: 'Крипто'     },
  { id: 'fashion',       label: 'Мода'       },
  { id: 'auto',          label: 'Авто'       },
  { id: 'culture',       label: 'Культура'   },
]

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  all:           '#6B7280',
  tech:          '#3B82F6',
  ai:            '#8B5CF6',
  general:       '#10B981',
  business:      '#F59E0B',
  startups:      '#EF4444',
  world:         '#06B6D4',
  politics:      '#64748B',
  entertainment: '#EC4899',
  music:         '#A855F7',
  cinema:        '#F97316',
  gaming:        '#22C55E',
  esports:       '#14B8A6',
  sport:         '#3B82F6',
  science:       '#0EA5E9',
  health:        '#10B981',
  crypto:        '#F59E0B',
  fashion:       '#F43F5E',
  auto:          '#6366F1',
  culture:       '#D946EF',
}

const activeCategory = computed(() => CATEGORIES.find(c => c.id === store.activeCategory)!)
const isFiltered = computed(() => store.activeCategory !== 'all')

onMounted(() => {
  if (store.items.length === 0) store.fetchNews()
})

function selectCategory(id: NewsCategory): void {
  store.setCategory(id)
  showFilterSheet.value = false
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin} мин. назад`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} ч. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function createPost(item: NewsItem): void {
  const text = `${item.title}\n\n${item.description}\n\nИсточник: ${item.link}`
  sessionStorage.setItem('news_draft', text)
  router.push({ name: 'post-create', query: { fromNews: '1' } })
}
</script>

<template>
  <div>
    <div class="news-page">

    <!-- Header -->
    <div class="news-page__header">
      <div class="news-page__header-left">
        <h1 class="news-page__title">Новости</h1>
        <!-- Active category badge -->
        <Transition name="badge-pop">
          <span
            v-if="isFiltered"
            class="news-page__active-badge"
            :style="{ background: CATEGORY_COLORS[store.activeCategory] }"
          >
            <NewsCategoryIcon :category="store.activeCategory" :size="13" />
            {{ activeCategory.label }}
          </span>
        </Transition>
      </div>

      <div class="news-page__header-actions">
        <!-- Filter button -->
        <button
          class="news-page__icon-btn"
          :class="{ 'news-page__icon-btn--active': isFiltered }"
          :style="isFiltered ? { color: CATEGORY_COLORS[store.activeCategory] } : {}"
          @click="showFilterSheet = true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
            <line x1="10" y1="18" x2="14" y2="18"/>
          </svg>
          <span v-if="isFiltered" class="news-page__icon-btn-dot" :style="{ background: CATEGORY_COLORS[store.activeCategory] }" />
        </button>

        <!-- Refresh button -->
        <button class="news-page__icon-btn" :disabled="store.loading" @click="store.refresh">
          <AppIcon name="refresh" :size="20" :class="{ 'spin': store.loading }" />
        </button>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="store.loading && store.items.length === 0" class="news-page__list">
      <div v-for="i in 6" :key="i" class="news-card news-card--skeleton">
        <div class="news-card__skeleton-source" />
        <div class="news-card__skeleton-title" />
        <div class="news-card__skeleton-title news-card__skeleton-title--short" />
        <div class="news-card__skeleton-desc" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="news-page__error">
      <AppIcon name="warning" :size="40" />
      <p>{{ store.error }}</p>
      <button class="news-page__retry" @click="store.refresh">Повторить</button>
    </div>

    <!-- Empty -->
    <div v-else-if="!store.loading && store.items.length === 0" class="news-page__empty">
      <AppIcon name="draft" :size="48" />
      <p>Нет новостей</p>
    </div>

    <!-- News list -->
    <div v-else class="news-page__list">
      <article v-for="item in store.items" :key="item.id" class="news-card">
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.title"
          class="news-card__image"
          loading="lazy"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div class="news-card__meta">
          <span class="news-card__source" :style="{ color: CATEGORY_COLORS[item.category] }">
            {{ item.sourceLabel }}
          </span>
          <span class="news-card__date">{{ formatDate(item.pubDate) }}</span>
        </div>
        <h2 class="news-card__title">{{ item.title }}</h2>
        <p v-if="item.description" class="news-card__desc">{{ item.description }}</p>
        <div class="news-card__actions">
          <a :href="item.link" target="_blank" rel="noopener" class="news-card__link">
            Читать <AppIcon name="chevron-right" :size="14" />
          </a>
          <button class="news-card__create-btn" @click="createPost(item)">
            <AppIcon name="plus" :size="14" />
            Создать пост
          </button>
        </div>
      </article>
    </div>

  </div>

  <!-- Filter bottom sheet -->
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="showFilterSheet" class="filter-overlay" @click="showFilterSheet = false" />
    </Transition>

    <Transition name="sheet-slide">
      <div v-if="showFilterSheet" class="filter-sheet">
        <div class="filter-sheet__handle" />

        <div class="filter-sheet__header">
          <span class="filter-sheet__title">Категория</span>
          <button class="filter-sheet__close" @click="showFilterSheet = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="filter-sheet__grid">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            class="filter-cat"
            :class="{ 'filter-cat--active': store.activeCategory === cat.id }"
            :style="store.activeCategory === cat.id
              ? { borderColor: CATEGORY_COLORS[cat.id], background: CATEGORY_COLORS[cat.id] + '18' }
              : {}"
            @click="selectCategory(cat.id)"
          >
            <span
              class="filter-cat__icon"
              :style="store.activeCategory === cat.id ? { color: CATEGORY_COLORS[cat.id] } : {}"
            >
              <NewsCategoryIcon :category="cat.id" :size="22" />
            </span>
            <span class="filter-cat__label" :style="store.activeCategory === cat.id ? { color: CATEGORY_COLORS[cat.id] } : {}">
              {{ cat.label }}
            </span>
            <span
              v-if="store.activeCategory === cat.id"
              class="filter-cat__check"
              :style="{ background: CATEGORY_COLORS[cat.id] }"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>

<style scoped>
.news-page {
  max-width: var(--fp-max-width);
  margin: 0 auto;
  padding: var(--fp-tg-header-height) var(--fp-spacing) calc(var(--fp-bottom-nav-height) + var(--fp-tg-bottom-inset) + 20px);
}

/* ── Header ── */
.news-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.news-page__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.news-page__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
  flex-shrink: 0;
}

.news-page__active-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
}

.news-page__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.news-page__icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
  transition: background var(--fp-transition), color var(--fp-transition);
  flex-shrink: 0;
}
.news-page__icon-btn:active { background: var(--fp-border); }
.news-page__icon-btn:disabled { opacity: 0.4; }
.news-page__icon-btn--active { background: var(--fp-bg-secondary); }

.news-page__icon-btn-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid var(--fp-bg);
}

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

/* ── News list ── */
.news-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Card ── */
.news-card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  overflow: hidden;
  border: 1px solid var(--fp-border);
}

.news-card__image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.news-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 0;
}

.news-card__source {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.news-card__date {
  font-size: 11px;
  color: var(--fp-text-tertiary);
  margin-left: auto;
}

.news-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
  line-height: 1.4;
  padding: 6px 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__desc {
  font-size: 13px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
  padding: 6px 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 12px;
}

.news-card__link {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  color: var(--fp-text-secondary);
  text-decoration: none;
}
.news-card__link:active { opacity: 0.7; }

.news-card__create-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  background: var(--fp-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: opacity var(--fp-transition);
}
.news-card__create-btn:active { opacity: 0.8; }

/* ── Skeleton ── */
.news-card--skeleton { padding: 12px; }
.news-card__skeleton-source,
.news-card__skeleton-title,
.news-card__skeleton-desc {
  background: var(--fp-border);
  border-radius: 6px;
  animation: pulse 1.4s ease-in-out infinite;
}
.news-card__skeleton-source { width: 80px; height: 12px; margin-bottom: 10px; }
.news-card__skeleton-title { width: 100%; height: 16px; margin-bottom: 6px; }
.news-card__skeleton-title--short { width: 65%; }
.news-card__skeleton-desc { width: 90%; height: 12px; margin-top: 10px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Error / Empty ── */
.news-page__error,
.news-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--fp-text-tertiary);
  text-align: center;
}
.news-page__retry {
  padding: 10px 24px;
  border-radius: 20px;
  background: var(--fp-primary);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

/* ── Filter overlay ── */
.filter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
}

/* ── Filter sheet ── */
.filter-sheet {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  padding: 12px 16px calc(max(env(safe-area-inset-bottom), 16px) + 16px);
  z-index: 201;
}

.filter-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.filter-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-sheet__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--fp-text);
}

.filter-sheet__close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
}
.filter-sheet__close:active { background: var(--fp-border); }

/* ── Category grid ── */
.filter-sheet__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.filter-cat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 6px 10px;
  border-radius: 14px;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg-secondary);
  transition: all 0.15s ease;
}
.filter-cat:active { transform: scale(0.94); }

.filter-cat--active {
  border-width: 1.5px;
}

.filter-cat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text-secondary);
  transition: color 0.15s;
}

.filter-cat__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--fp-text-secondary);
  text-align: center;
  line-height: 1.2;
  transition: color 0.15s;
}

.filter-cat__check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Transitions ── */
.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

.sheet-slide-enter-active,
.sheet-slide-leave-active { transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-slide-enter-from,
.sheet-slide-leave-to { transform: translateX(-50%) translateY(100%); }

/* ── Badge pop ── */
.badge-pop-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.badge-pop-leave-active { transition: all 0.15s ease; }
.badge-pop-enter-from { opacity: 0; transform: scale(0.7); }
.badge-pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
