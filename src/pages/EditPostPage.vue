<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/usePostsStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import PostEditor from '@/components/posts/PostEditor.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import DateTimePicker from '@/components/scheduler/DateTimePicker.vue'

const props = defineProps<{ id: string }>()

const router = useRouter()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()
const schedulerStore = useSchedulerStore()


const content = ref('')
const saving = ref(false)
const showScheduler = ref(false)

onMounted(async () => {
  await channelsStore.fetchChannels()
  await postsStore.fetchPost(props.id)
  if (postsStore.currentPost) {
    content.value = postsStore.currentPost.content
  }
})

async function save(): Promise<void> {
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value })
  } finally {
    saving.value = false
  }
}

async function publish(): Promise<void> {
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value })
    await postsStore.publishPost(props.id)
    router.push({ name: 'home' })
  } finally {
    saving.value = false
  }
}

async function schedule(isoDate: string): Promise<void> {
  showScheduler.value = false
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value })
    await schedulerStore.schedulePost({ postId: props.id, scheduledAt: isoDate })
    router.push({ name: 'calendar' })
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  await postsStore.deletePost(props.id)
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="edit-post">
    <div class="edit-post__header">
      <button class="edit-post__back" @click="router.back()">
        <AppIcon name="arrow-left" :size="22" />
      </button>
      <h1>Редактирование</h1>
    </div>

    <AppLoader v-if="postsStore.loading" />

    <template v-else-if="postsStore.currentPost">
      <div class="mt">
        <PostEditor
          v-model="content"
          :channel-id="postsStore.currentPost.channelId"
        />
      </div>

      <div class="edit-post__actions mt">
        <AppButton block :loading="saving" @click="save">
          <AppIcon name="check" :size="18" />
          Сохранить
        </AppButton>
        <div class="edit-post__actions-row">
          <AppButton block variant="secondary" :loading="saving" @click="publish">
            <AppIcon name="rocket" :size="18" />
            Опубликовать
          </AppButton>
          <AppButton block variant="secondary" :loading="saving" @click="showScheduler = true">
            <AppIcon name="clock" :size="18" />
            Запланировать
          </AppButton>
        </div>
        <AppButton block variant="danger" @click="remove">
          <AppIcon name="trash" :size="18" />
          Удалить
        </AppButton>
      </div>
    </template>

    <div v-else class="edit-post__empty">
      <AppIcon name="draft" :size="48" color="var(--fp-text-tertiary)" />
      <p>Пост не найден</p>
    </div>

    <DateTimePicker
      v-if="showScheduler"
      title="Запланировать пост"
      @close="showScheduler = false"
      @confirm="schedule"
    />
  </div>
</template>

<style scoped>
.edit-post__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: var(--fp-spacing);
}

.edit-post__header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
}

.edit-post__back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fp-transition);
}

.edit-post__back:active {
  transform: scale(0.9);
  background: var(--fp-bg-tertiary);
}

.edit-post__actions {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.edit-post__actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--fp-spacing-sm);
}

.edit-post__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  text-align: center;
}

.edit-post__empty p {
  font-size: 15px;
  color: var(--fp-text-secondary);
}
</style>
