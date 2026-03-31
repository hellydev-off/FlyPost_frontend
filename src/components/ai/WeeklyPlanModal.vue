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
const creatingId = ref<number | null>(null)

onMounted(async () => {
  try {
    ideas.value = await aiApi.weeklyPlan(props.channelId)
  } catch {
    toast.show('Не удалось сгенерировать план', 'error')
    emit('close')
  } finally {
    loading.value = false
  }
})

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

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}
</script>

<template>
  <AppModal title="AI-план на неделю" @close="emit('close')">
    <AppLoader v-if="loading" />

    <div v-else class="weekly-plan">
      <p class="weekly-plan__subtitle">
        {{ ideas.length }} идей для постов. Нажми на идею, чтобы создать черновик.
      </p>

      <div class="weekly-plan__list">
        <div
          v-for="(idea, i) in ideas"
          :key="i"
          class="weekly-plan__item"
        >
          <div class="weekly-plan__item-body">
            <div class="weekly-plan__item-header">
              <span class="weekly-plan__item-title">{{ idea.title }}</span>
              <span class="weekly-plan__item-time">
                <AppIcon name="clock" :size="12" color="var(--fp-text-tertiary)" />
                {{ formatHour(idea.suggestedHour) }}
              </span>
            </div>
            <p class="weekly-plan__item-summary">{{ idea.summary }}</p>
          </div>

          <AppButton
            variant="secondary"
            :loading="creatingId === i"
            :disabled="creatingId !== null"
            @click="createDraft(idea, i)"
          >
            <AppIcon name="draft" :size="15" />
            Черновик
          </AppButton>
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

.weekly-plan__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.weekly-plan__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--fp-bg-secondary);
  border-radius: calc(var(--fp-radius) - 2px);
}

.weekly-plan__item-body {
  flex: 1;
  min-width: 0;
}

.weekly-plan__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.weekly-plan__item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text);
}

.weekly-plan__item-time {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: var(--fp-text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

.weekly-plan__item-summary {
  font-size: 13px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}
</style>
