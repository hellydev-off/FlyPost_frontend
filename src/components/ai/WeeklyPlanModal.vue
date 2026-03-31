<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const ideas = ref<WeeklyPlanIdea[]>([])
const loading = ref(true)
const error = ref(false)
const creatingId = ref<number | null>(null)

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

onMounted(() => { load() })

async function load(): Promise<void> {
  loading.value = true
  error.value = false
  try {
    ideas.value = await aiApi.weeklyPlan(props.channelId)
  } catch {
    error.value = true
    toast.show('Не удалось сгенерировать план', 'error')
  } finally {
    loading.value = false
  }
}

async function createDraft(idea: WeeklyPlanIdea, idx: number): Promise<void> {
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

function dayLabel(idx: number): string {
  return WEEK_DAYS[idx % 7]
}

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}
</script>

<template>
  <AppModal title="AI-план на неделю" @close="emit('close')">
    <AppLoader v-if="loading" />

    <div v-else-if="error" class="weekly-plan__error">
      <AppIcon name="alert-circle" :size="36" color="var(--fp-error)" />
      <p>Не удалось сгенерировать план</p>
      <AppButton variant="secondary" @click="load">
        <AppIcon name="refresh" :size="15" />
        Попробовать снова
      </AppButton>
    </div>

    <div v-else class="weekly-plan">
      <p class="weekly-plan__subtitle">
        {{ ideas.length }} идей на неделю — нажми, чтобы создать черновик
      </p>

      <div class="weekly-plan__list">
        <div
          v-for="(idea, i) in ideas"
          :key="i"
          class="weekly-plan__item"
        >
          <div class="weekly-plan__day-badge">
            <span class="weekly-plan__day-name">{{ dayLabel(i) }}</span>
            <span class="weekly-plan__day-hour">{{ formatHour(idea.suggestedHour) }}</span>
          </div>

          <div class="weekly-plan__item-body">
            <span class="weekly-plan__item-title">{{ idea.title }}</span>
            <p class="weekly-plan__item-summary">{{ idea.summary }}</p>
          </div>

          <button
            class="weekly-plan__create-btn"
            :disabled="creatingId !== null"
            @click="createDraft(idea, i)"
          >
            <AppIcon v-if="creatingId === i" name="refresh" :size="15" />
            <AppIcon v-else name="draft" :size="15" />
          </button>
        </div>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.weekly-plan__subtitle {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin-bottom: 14px;
}

/* Error state */
.weekly-plan__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  text-align: center;
}

.weekly-plan__error p {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

/* List */
.weekly-plan__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weekly-plan__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
}

/* Day badge */
.weekly-plan__day-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  padding: 6px 4px;
  background: var(--fp-primary-bg);
  border-radius: 8px;
  flex-shrink: 0;
}

.weekly-plan__day-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--fp-primary);
  line-height: 1;
}

.weekly-plan__day-hour {
  font-size: 10px;
  color: var(--fp-primary);
  opacity: 0.7;
  margin-top: 2px;
}

/* Body */
.weekly-plan__item-body {
  flex: 1;
  min-width: 0;
}

.weekly-plan__item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text);
  display: block;
  margin-bottom: 3px;
}

.weekly-plan__item-summary {
  font-size: 12px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

/* Create button */
.weekly-plan__create-btn {
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

.weekly-plan__create-btn:not(:disabled):active {
  background: var(--fp-primary);
  color: #fff;
  transform: scale(0.9);
}

.weekly-plan__create-btn:disabled {
  opacity: 0.4;
}
</style>
