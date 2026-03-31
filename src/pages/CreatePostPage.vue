<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { usePostsStore } from '@/stores/usePostsStore'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import { useToastStore } from '@/stores/useToastStore'
import PostEditor from '@/components/posts/PostEditor.vue'
import DateTimePicker from '@/components/scheduler/DateTimePicker.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const channelsStore = useChannelsStore()
const postsStore = usePostsStore()
const schedulerStore = useSchedulerStore()
const toast = useToastStore()

const content = ref('')
const selectedChannelId = ref('')
const showScheduler = ref(false)
const publishing = ref(false)
const scheduling = ref(false)

onMounted(async () => {
  await channelsStore.fetchChannels()
  if (channelsStore.selectedChannelId) {
    selectedChannelId.value = channelsStore.selectedChannelId
  }
})

async function saveDraft(): Promise<void> {
  if (!validate()) return
  const post = await postsStore.createPost({
    channelId: selectedChannelId.value,
    content: content.value,
  })
  if (post) router.push({ name: 'home' })
}

async function publishNow(): Promise<void> {
  if (!validate()) return
  publishing.value = true
  try {
    const post = await postsStore.createPost({
      channelId: selectedChannelId.value,
      content: content.value,
    })
    if (post) {
      await postsStore.publishPost(post.id)
      router.push({ name: 'home' })
    }
  } finally {
    publishing.value = false
  }
}

async function onSchedule(scheduledAt: string): Promise<void> {
  if (!validate()) return
  scheduling.value = true
  try {
    const post = await postsStore.createPost({
      channelId: selectedChannelId.value,
      content: content.value,
    })
    if (post) {
      await schedulerStore.schedulePost({ postId: post.id, scheduledAt })
      showScheduler.value = false
      router.push({ name: 'calendar' })
    }
  } finally {
    scheduling.value = false
  }
}

function validate(): boolean {
  if (!selectedChannelId.value) {
    toast.show('Выберите канал', 'error')
    return false
  }
  if (!content.value.trim()) {
    toast.show('Напишите текст поста', 'error')
    return false
  }
  return true
}

const selectedChannelTitle = ref('')
function onChannelChange(e: Event): void {
  const select = e.target as HTMLSelectElement
  selectedChannelId.value = select.value
  selectedChannelTitle.value = select.options[select.selectedIndex]?.text ?? ''
}
</script>

<template>
  <div class="create-post">
    <h1 class="create-post__title">Новый пост</h1>

    <!-- Channel selector -->
    <div class="create-post__section">
      <label class="create-post__label">Канал</label>
      <div class="create-post__channel-select">
        <AppIcon name="channels" :size="18" color="var(--fp-primary)" />
        <select
          :value="selectedChannelId"
          class="create-post__select"
          @change="onChannelChange"
        >
          <option value="" disabled>Выберите канал</option>
          <option
            v-for="ch in channelsStore.channels"
            :key="ch.id"
            :value="ch.id"
          >
            {{ ch.title }}
          </option>
        </select>
        <AppIcon name="chevron-down" :size="16" color="var(--fp-text-tertiary)" />
      </div>
    </div>

    <!-- Editor -->
    <div class="create-post__section">
      <PostEditor
        v-model="content"
        :channel-id="selectedChannelId"
      />
    </div>

    <!-- Action buttons -->
    <div class="create-post__actions">
      <div class="create-post__actions-row">
        <AppButton block :loading="publishing" @click="publishNow">
          <AppIcon name="rocket" :size="18" />
          Опубликовать
        </AppButton>
      </div>
      <div class="create-post__actions-row create-post__actions-row--split">
        <AppButton block variant="secondary" @click="showScheduler = true">
          <AppIcon name="clock" :size="16" />
          Запланировать
        </AppButton>
        <AppButton block variant="ghost" @click="saveDraft">
          <AppIcon name="draft" :size="16" />
          Черновик
        </AppButton>
      </div>
    </div>

    <DateTimePicker
      v-if="showScheduler"
      title="Запланировать публикацию"
      @close="showScheduler = false"
      @confirm="onSchedule"
    />
  </div>
</template>

<style scoped>
.create-post__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 20px;
}

.create-post__section {
  margin-bottom: 16px;
}

.create-post__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  margin-bottom: 6px;
}

/* Channel selector */
.create-post__channel-select {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  position: relative;
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.create-post__channel-select:focus-within {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
}

.create-post__select {
  flex: 1;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  appearance: none;
  color: var(--fp-text);
}

/* Actions */
.create-post__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.create-post__actions-row--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
