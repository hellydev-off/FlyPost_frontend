<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { aiApi } from '@/api/ai.api'
import { usePostsStore } from '@/stores/usePostsStore'
import { useToastStore } from '@/stores/useToastStore'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { WeeklyPlanIdea } from '@/types/competitor.types'

const props = defineProps<{ channelId: string }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const postsStore = usePostsStore()
const toast = useToastStore()

// Step: 'setup' | 'result'
const step = ref<'setup' | 'result'>('setup')
const postsPerDay = ref(1)

const ideas = ref<WeeklyPlanIdea[]>([])
const loading = ref(false)
const error = ref(false)
const creatingKey = ref<string | null>(null)

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const WEEK_DAYS_FULL = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

// Группируем идеи по дням
const byDay = computed(() => {
  return WEEK_DAYS.map((_, i) => ({
    short: WEEK_DAYS[i],
    full: WEEK_DAYS_FULL[i],
    ideas: ideas.value.filter(idea => idea.dayIndex === i),
  }))
})

async function generate(): Promise<void> {
  step.value = 'result'
  loading.value = true
  error.value = false
  try {
    ideas.value = await aiApi.weeklyPlan(props.channelId, postsPerDay.value)
  } catch {
    error.value = true
    toast.show('Не удалось сгенерировать план', 'error')
  } finally {
    loading.value = false
  }
}

async function createDraft(idea: WeeklyPlanIdea, dayIndex: number, postIndex: number): Promise<void> {
  const key = `${dayIndex}-${postIndex}`
  creatingKey.value = key
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
    creatingKey.value = null
  }
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}
</script>

<template>
  <AppModal :title="step === 'setup' ? 'AI-план на неделю' : 'План на неделю'" @close="emit('close')">

    <!-- ── Шаг 1: настройка ── -->
    <div v-if="step === 'setup'" class="wp-setup">
      <p class="wp-setup__desc">
        AI подберёт темы для каждого дня недели — тебе останется только писать
      </p>

      <div class="wp-setup__field">
        <p class="wp-setup__label">Постов в день</p>
        <div class="wp-setup__picker">
          <button
            v-for="n in 4"
            :key="n"
            class="wp-setup__pick-btn"
            :class="{ 'wp-setup__pick-btn--active': postsPerDay === n }"
            @click="postsPerDay = n"
          >
            {{ n }}
          </button>
        </div>
        <p class="wp-setup__hint">Итого: {{ postsPerDay * 7 }} постов на неделю</p>
      </div>

      <AppButton block @click="generate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Сгенерировать план
      </AppButton>
    </div>

    <!-- ── Шаг 2: загрузка ── -->
    <div v-else-if="loading" class="wp-loading">
      <AppLoader />
      <p class="wp-loading__text">Генерирую {{ postsPerDay * 7 }} идей для твоего канала...</p>
    </div>

    <!-- ── Шаг 2: ошибка ── -->
    <div v-else-if="error" class="wp-error">
      <AppIcon name="alert-circle" :size="36" color="var(--fp-error)" />
      <p>Не удалось сгенерировать план</p>
      <div class="wp-error__actions">
        <AppButton variant="secondary" @click="generate">
          <AppIcon name="refresh" :size="15" />
          Попробовать снова
        </AppButton>
        <AppButton variant="ghost" @click="step = 'setup'">Назад</AppButton>
      </div>
    </div>

    <!-- ── Шаг 2: результат ── -->
    <div v-else class="wp-result">
      <p class="wp-result__subtitle">
        Нажми <AppIcon name="draft" :size="13" style="display:inline;vertical-align:middle" /> чтобы создать черновик
      </p>

      <div class="wp-days">
        <div v-for="(day, di) in byDay" :key="di" class="wp-day">
          <div class="wp-day__header">
            <span class="wp-day__name">{{ day.full }}</span>
            <span class="wp-day__short">{{ day.short }}</span>
          </div>

          <div class="wp-day__posts">
            <div
              v-for="(idea, pi) in day.ideas"
              :key="pi"
              class="wp-post"
            >
              <div class="wp-post__time">{{ formatHour(idea.suggestedHour) }}</div>
              <div class="wp-post__body">
                <span class="wp-post__title">{{ idea.title }}</span>
                <p class="wp-post__summary">{{ idea.summary }}</p>
              </div>
              <button
                class="wp-post__btn"
                :disabled="creatingKey !== null"
                @click="createDraft(idea, di, pi)"
              >
                <AppIcon
                  :name="creatingKey === `${di}-${pi}` ? 'refresh' : 'draft'"
                  :size="14"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button class="wp-result__back" @click="step = 'setup'">
        <AppIcon name="refresh" :size="14" />
        Изменить настройки
      </button>
    </div>

  </AppModal>
</template>

<style scoped>
/* ── Setup ── */
.wp-setup {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wp-setup__desc {
  font-size: 14px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

.wp-setup__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wp-setup__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--fp-text);
}

.wp-setup__picker {
  display: flex;
  gap: 8px;
}

.wp-setup__pick-btn {
  flex: 1;
  height: 52px;
  border-radius: 12px;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg-secondary);
  font-size: 20px;
  font-weight: 800;
  color: var(--fp-text-secondary);
  transition: all 0.18s ease;
}

.wp-setup__pick-btn--active {
  border-color: var(--fp-primary);
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  transform: scale(1.04);
}

.wp-setup__hint {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

/* ── Loading ── */
.wp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 0 8px;
}

.wp-loading__text {
  font-size: 13px;
  color: var(--fp-text-secondary);
  text-align: center;
}

/* ── Error ── */
.wp-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  text-align: center;
}

.wp-error p {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.wp-error__actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

/* ── Result ── */
.wp-result__subtitle {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.wp-days {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Day block */
.wp-day__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.wp-day__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--fp-text);
}

.wp-day__short {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-primary);
  background: var(--fp-primary-bg);
  padding: 2px 8px;
  border-radius: 6px;
}

.wp-day__posts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Post row */
.wp-post {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--fp-bg-secondary);
  border-radius: 10px;
}

.wp-post__time {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-primary);
  background: var(--fp-primary-bg);
  padding: 3px 7px;
  border-radius: 6px;
  flex-shrink: 0;
  margin-top: 2px;
  white-space: nowrap;
}

.wp-post__body {
  flex: 1;
  min-width: 0;
}

.wp-post__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  display: block;
  margin-bottom: 2px;
}

.wp-post__summary {
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.45;
}

.wp-post__btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fp-bg-tertiary);
  color: var(--fp-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}

.wp-post__btn:not(:disabled):active {
  background: var(--fp-primary);
  color: #fff;
  transform: scale(0.9);
}

.wp-post__btn:disabled { opacity: 0.4; }

.wp-result__back {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  transition: color var(--fp-transition);
}

.wp-result__back:active { color: var(--fp-text); }
</style>
