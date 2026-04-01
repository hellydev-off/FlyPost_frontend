<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { aiApi } from '@/api/ai.api'
import { usePostsStore } from '@/stores/usePostsStore'
import { useToastStore } from '@/stores/useToastStore'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { DailyPlanIdea } from '@/types/competitor.types'

const props = defineProps<{ channelId: string; publishedPostsCount: number }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const postsStore = usePostsStore()
const toast = useToastStore()

type Step = 'settings' | 'loading' | 'results'
const step = ref<Step>('settings')
const ideas = ref<DailyPlanIdea[]>([])
const warning = ref<string | undefined>()
const error = ref(false)
const creatingId = ref<number | null>(null)

const INTERVAL_OPTIONS = [
  { label: '30 мин', value: 30 },
  { label: '1 час', value: 60 },
  { label: '1.5 ч', value: 90 },
  { label: '2 часа', value: 120 },
  { label: '3 часа', value: 180 },
  { label: '4 часа', value: 240 },
  { label: '6 часов', value: 360 },
]

const START_HOURS = Array.from({ length: 15 }, (_, i) => i + 6) // 6..20

const selectedInterval = ref(60)
const selectedStartHour = ref(9)

const previewSlots = computed(() => {
  const slots: string[] = []
  let cur = selectedStartHour.value * 60
  while (cur <= 22 * 60 && slots.length < 8) {
    const h = Math.floor(cur / 60)
    const m = cur % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    cur += selectedInterval.value
  }
  return slots
})

const notEnoughPosts = computed(() => props.publishedPostsCount < 5)

async function generate(): Promise<void> {
  step.value = 'loading'
  error.value = false
  try {
    const result = await aiApi.dailyPlan(props.channelId, selectedStartHour.value, selectedInterval.value)
    ideas.value = result.ideas
    warning.value = result.warning
    step.value = 'results'
  } catch {
    error.value = true
    step.value = 'results'
    toast.show('Не удалось сгенерировать план', 'error')
  }
}

async function createDraft(idea: DailyPlanIdea, idx: number): Promise<void> {
  creatingId.value = idx
  try {
    const content = `${idea.title}\n\n${idea.summary}`
    const post = await postsStore.createPost({ channelId: props.channelId, content })
    if (post) {
      emit('close')
      router.push({ name: 'post-edit', params: { id: post.id } })
    }
  } catch {
    toast.show('Ошибка создания черновика', 'error')
  } finally {
    creatingId.value = null
  }
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}

function backToSettings(): void {
  step.value = 'settings'
  ideas.value = []
  warning.value = undefined
  error.value = false
}
</script>

<template>
  <AppModal title="AI-план на день" @close="emit('close')">

    <!-- Step: settings -->
    <div v-if="step === 'settings'" class="daily-plan-settings">

      <!-- Warning: few posts -->
      <div v-if="notEnoughPosts" class="daily-plan-settings__warning">
        <AppIcon name="alert-circle" :size="15" color="var(--fp-warning)" />
        <span>
          Мало опубликованных постов ({{ publishedPostsCount }} из 5) — план может быть неточным.
          Вы всё равно можете сгенерировать.
        </span>
      </div>

      <!-- Start hour -->
      <div class="daily-plan-settings__field">
        <label class="daily-plan-settings__label">Начало публикаций</label>
        <select v-model="selectedStartHour" class="daily-plan-settings__select">
          <option v-for="h in START_HOURS" :key="h" :value="h">{{ formatHour(h) }}</option>
        </select>
      </div>

      <!-- Interval -->
      <div class="daily-plan-settings__field">
        <label class="daily-plan-settings__label">Интервал между постами</label>
        <div class="daily-plan-settings__chips">
          <button
            v-for="opt in INTERVAL_OPTIONS"
            :key="opt.value"
            class="daily-plan-settings__chip"
            :class="{ 'daily-plan-settings__chip--active': selectedInterval === opt.value }"
            @click="selectedInterval = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div class="daily-plan-settings__preview">
        <span class="daily-plan-settings__preview-label">
          {{ previewSlots.length }} {{ previewSlots.length === 1 ? 'пост' : 'поста/постов' }}:
        </span>
        <span class="daily-plan-settings__preview-slots">{{ previewSlots.join(' · ') }}</span>
      </div>

      <AppButton class="daily-plan-settings__btn" @click="generate">
        <AppIcon name="bolt" :size="15" />
        Сгенерировать
      </AppButton>
    </div>

    <!-- Step: loading -->
    <AppLoader v-else-if="step === 'loading'" />

    <!-- Step: results -->
    <div v-else class="daily-plan-results">

      <!-- Error -->
      <div v-if="error" class="daily-plan-results__error">
        <AppIcon name="alert-circle" :size="36" color="var(--fp-error)" />
        <p>Не удалось сгенерировать план</p>
        <AppButton variant="secondary" @click="backToSettings">
          <AppIcon name="refresh" :size="15" />
          Попробовать снова
        </AppButton>
      </div>

      <template v-else>
        <!-- Warning banner -->
        <div v-if="warning" class="daily-plan-results__warning">
          <AppIcon name="alert-circle" :size="14" color="var(--fp-warning)" />
          <span>{{ warning }}</span>
        </div>

        <p class="daily-plan-results__subtitle">
          {{ ideas.length }} идей на сегодня — нажми, чтобы создать черновик
        </p>

        <div class="daily-plan-results__list">
          <div
            v-for="(idea, i) in ideas"
            :key="i"
            class="daily-plan-results__item"
          >
            <div class="daily-plan-results__time-badge">
              {{ idea.scheduledTime }}
            </div>

            <div class="daily-plan-results__body">
              <span class="daily-plan-results__title">{{ idea.title }}</span>
              <p class="daily-plan-results__summary">{{ idea.summary }}</p>
            </div>

            <button
              class="daily-plan-results__create-btn"
              :disabled="creatingId !== null"
              @click="createDraft(idea, i)"
            >
              <AppIcon v-if="creatingId === i" name="refresh" :size="15" />
              <AppIcon v-else name="draft" :size="15" />
            </button>
          </div>
        </div>

        <button class="daily-plan-results__back" @click="backToSettings">
          <AppIcon name="chevron-left" :size="14" />
          Изменить настройки
        </button>
      </template>
    </div>

  </AppModal>
</template>

<style scoped>
/* Settings */
.daily-plan-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.daily-plan-settings__warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: var(--fp-warning-bg, rgba(255, 170, 0, 0.1));
  border-radius: var(--fp-radius-sm);
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

.daily-plan-settings__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daily-plan-settings__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.daily-plan-settings__select {
  padding: 10px 12px;
  background: var(--fp-bg-secondary);
  border: 1px solid var(--fp-border);
  border-radius: var(--fp-radius-sm);
  color: var(--fp-text);
  font-size: 14px;
  width: 100%;
}

.daily-plan-settings__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.daily-plan-settings__chip {
  padding: 7px 14px;
  border-radius: 20px;
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
  font-size: 13px;
  border: 1px solid var(--fp-border);
  transition: all var(--fp-transition);
}

.daily-plan-settings__chip--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
  font-weight: 600;
}

.daily-plan-settings__preview {
  padding: 10px 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  font-size: 12px;
  line-height: 1.6;
}

.daily-plan-settings__preview-label {
  color: var(--fp-text-secondary);
  margin-right: 4px;
}

.daily-plan-settings__preview-slots {
  color: var(--fp-primary);
  font-weight: 500;
}

.daily-plan-settings__btn {
  width: 100%;
}

/* Results */
.daily-plan-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.daily-plan-results__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  text-align: center;
}

.daily-plan-results__error p {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.daily-plan-results__warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--fp-warning-bg, rgba(255, 170, 0, 0.1));
  border-radius: var(--fp-radius-sm);
  font-size: 12px;
  color: var(--fp-text-secondary);
}

.daily-plan-results__subtitle {
  font-size: 13px;
  color: var(--fp-text-secondary);
}

.daily-plan-results__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.daily-plan-results__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
}

.daily-plan-results__time-badge {
  min-width: 42px;
  padding: 5px 4px;
  background: var(--fp-primary-bg);
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--fp-primary);
  flex-shrink: 0;
}

.daily-plan-results__body {
  flex: 1;
  min-width: 0;
}

.daily-plan-results__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  display: block;
  margin-bottom: 3px;
}

.daily-plan-results__summary {
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

.daily-plan-results__create-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--fp-bg-tertiary);
  color: var(--fp-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}

.daily-plan-results__create-btn:not(:disabled):active {
  background: var(--fp-primary);
  color: #fff;
  transform: scale(0.9);
}

.daily-plan-results__create-btn:disabled {
  opacity: 0.4;
}

.daily-plan-results__back {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin-top: 4px;
}
</style>
