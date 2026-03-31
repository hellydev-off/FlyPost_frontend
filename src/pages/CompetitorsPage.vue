<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { competitorApi } from '@/api/competitor.api'
import { useToastStore } from '@/stores/useToastStore'
import { usePlanStore } from '@/stores/usePlanStore'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import FeatureLock from '@/components/common/FeatureLock.vue'
import type { Competitor, CompetitorAnalysis } from '@/types/competitor.types'

const planStore = usePlanStore()

const toast = useToastStore()

const competitors = ref<Competitor[]>([])
const loading = ref(true)
const addLoading = ref(false)
const analyzingId = ref<string | null>(null)
const expandedId = ref<string | null>(null)

const newUsername = ref('')
const newTitle = ref('')
const showAddForm = ref(false)

onMounted(async () => {
  competitors.value = await competitorApi.getAll()
  loading.value = false
})

async function addCompetitor(): Promise<void> {
  const username = newUsername.value.trim()
  const title = newTitle.value.trim() || username
  if (!username) return

  addLoading.value = true
  try {
    const c = await competitorApi.add({ channelUsername: username, title })
    competitors.value.unshift(c)
    newUsername.value = ''
    newTitle.value = ''
    showAddForm.value = false
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ошибка добавления'
    toast.show(msg, 'error')
  } finally {
    addLoading.value = false
  }
}

async function analyze(id: string): Promise<void> {
  analyzingId.value = id
  try {
    const updated = await competitorApi.analyze(id)
    const idx = competitors.value.findIndex(c => c.id === id)
    if (idx !== -1) competitors.value[idx] = updated
    expandedId.value = id
    toast.show('Анализ готов', 'success')
  } catch {
    toast.show('Не удалось проанализировать канал', 'error')
  } finally {
    analyzingId.value = null
  }
}

async function remove(id: string): Promise<void> {
  await competitorApi.delete(id)
  competitors.value = competitors.value.filter(c => c.id !== id)
}

function parseAnalysis(raw: string | null): CompetitorAnalysis | null {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

function formatCount(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)
}

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="competitors">
    <div class="competitors__header">
      <h1 class="competitors__title">Конкуренты</h1>
      <button v-if="planStore.hasFeature('competitors')" class="competitors__add-btn" @click="showAddForm = !showAddForm">
        <AppIcon :name="showAddForm ? 'close' : 'plus'" :size="20" />
      </button>
    </div>

    <FeatureLock
      v-if="!planStore.hasFeature('competitors')"
      title="Анализ конкурентов"
      description="Отслеживайте Telegram-каналы конкурентов, получайте AI-анализ их контента и стратегии. Доступно на тарифах Про и Максимум."
    />

    <template v-else>
    <!-- Add form -->
    <div v-if="showAddForm" class="competitors__form">
      <input
        v-model="newUsername"
        class="competitors__input"
        placeholder="@username канала"
        @keydown.enter="addCompetitor"
      />
      <input
        v-model="newTitle"
        class="competitors__input"
        placeholder="Название (необязательно)"
        @keydown.enter="addCompetitor"
      />
      <AppButton block :loading="addLoading" :disabled="!newUsername.trim()" @click="addCompetitor">
        Добавить
      </AppButton>
    </div>

    <AppLoader v-if="loading" />

    <div v-else-if="competitors.length === 0" class="competitors__empty">
      <AppIcon name="chart" :size="48" color="var(--fp-text-tertiary)" />
      <p>Добавьте каналы конкурентов для анализа</p>
    </div>

    <div v-else class="competitors__list">
      <div v-for="c in competitors" :key="c.id" class="competitors__card">
        <div class="competitors__card-header">
          <div class="competitors__card-info">
            <span class="competitors__card-title">{{ c.title }}</span>
            <span class="competitors__card-username">@{{ c.channelUsername }}</span>
          </div>

          <div class="competitors__card-actions">
            <div v-if="parseAnalysis(c.lastAnalysis)" class="competitors__member-count">
              <AppIcon name="user" :size="13" color="var(--fp-text-tertiary)" />
              {{ formatCount(parseAnalysis(c.lastAnalysis)!.memberCount) }}
            </div>
            <button
              class="competitors__icon-btn"
              :class="{ 'competitors__icon-btn--loading': analyzingId === c.id }"
              :disabled="analyzingId !== null"
              :title="c.lastAnalysis ? 'Обновить анализ' : 'Анализировать'"
              @click="analyze(c.id)"
            >
              <span v-if="analyzingId === c.id" class="competitors__spinner" />
              <AppIcon v-else name="sparkles" :size="18" color="var(--fp-primary)" />
            </button>
            <button
              v-if="c.lastAnalysis"
              class="competitors__icon-btn"
              :title="expandedId === c.id ? 'Скрыть' : 'Показать анализ'"
              @click="toggleExpand(c.id)"
            >
              <AppIcon
                :name="expandedId === c.id ? 'chevron-left' : 'chevron-down'"
                :size="18"
                color="var(--fp-text-secondary)"
              />
            </button>
            <button class="competitors__icon-btn" title="Удалить" @click="remove(c.id)">
              <AppIcon name="trash" :size="18" color="var(--fp-error, #ef4444)" />
            </button>
          </div>
        </div>

        <!-- Analysis -->
        <div v-if="expandedId === c.id && parseAnalysis(c.lastAnalysis)" class="competitors__analysis">
          <p class="competitors__analysis-text">{{ parseAnalysis(c.lastAnalysis)!.insights }}</p>
          <span class="competitors__analysis-date">
            Обновлено {{ new Date(c.analyzedAt!).toLocaleDateString('ru-RU') }}
          </span>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<style scoped>
.competitors__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.competitors__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.competitors__add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fp-text);
  transition: all var(--fp-transition);
}

.competitors__add-btn:active { transform: scale(0.9); }

.competitors__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  margin-bottom: 16px;
}

.competitors__input {
  padding: 12px 14px;
  background: var(--fp-bg);
  border-radius: calc(var(--fp-radius) - 4px);
  font-size: 15px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.competitors__input:focus {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
}

.competitors__input::placeholder { color: var(--fp-text-tertiary); }

.competitors__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  text-align: center;
}

.competitors__empty p {
  font-size: 15px;
  color: var(--fp-text-secondary);
}

.competitors__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.competitors__card {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 14px 16px;
}

.competitors__card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.competitors__card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.competitors__card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.competitors__card-username {
  font-size: 13px;
  color: var(--fp-text-tertiary);
}

.competitors__card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.competitors__member-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--fp-text-tertiary);
  font-weight: 600;
  margin-right: 4px;
}

.competitors__icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fp-bg);
  transition: all var(--fp-transition);
}

.competitors__icon-btn:active:not(:disabled) { transform: scale(0.9); }
.competitors__icon-btn:disabled { opacity: 0.4; }

.competitors__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--fp-bg-tertiary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.competitors__analysis {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--fp-border);
}

.competitors__analysis-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--fp-text-secondary);
  white-space: pre-line;
}

.competitors__analysis-date {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--fp-text-tertiary);
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
