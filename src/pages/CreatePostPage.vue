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

const router = useRouter()
const channelsStore = useChannelsStore()
const postsStore = usePostsStore()
const schedulerStore = useSchedulerStore()
const toast = useToastStore()

const content = ref('')
const selectedChannelId = ref('')
const showScheduler = ref(false)
const publishing = ref(false)

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
  const post = await postsStore.createPost({
    channelId: selectedChannelId.value,
    content: content.value,
  })
  if (post) {
    await schedulerStore.schedulePost({ postId: post.id, scheduledAt })
    showScheduler.value = false
    router.push({ name: 'scheduler' })
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
</script>

<template>
  <div class="create-post">
    <h1>Новый пост</h1>

    <div class="create-post__channel mt">
      <label class="text-hint">Канал</label>
      <select v-model="selectedChannelId" class="create-post__select">
        <option value="" disabled>Выберите канал</option>
        <option
          v-for="ch in channelsStore.channels"
          :key="ch.id"
          :value="ch.id"
        >
          {{ ch.title }}
        </option>
      </select>
    </div>

    <div class="mt">
      <PostEditor
        v-model="content"
        :channel-id="selectedChannelId"
      />
    </div>

    <div class="create-post__actions mt">
      <AppButton block :loading="publishing" @click="publishNow">
        Опубликовать сейчас
      </AppButton>
      <AppButton block variant="secondary" @click="showScheduler = true">
        Запланировать
      </AppButton>
      <AppButton block variant="ghost" @click="saveDraft">
        Сохранить черновик
      </AppButton>
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
.create-post h1 {
  font-size: 24px;
  font-weight: 700;
}

.create-post__channel {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-xs);
}

.create-post__select {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
  appearance: none;
  width: 100%;
}

.create-post__actions {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
