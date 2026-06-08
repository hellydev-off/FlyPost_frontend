<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { usePostsStore } from '@/stores/usePostsStore'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import { useToastStore } from '@/stores/useToastStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import PostEditor from '@/components/posts/PostEditor.vue'
import MediaUpload from '@/components/posts/MediaUpload.vue'
import CrossPostModal from '@/components/posts/CrossPostModal.vue'
import PostOptions from '@/components/posts/PostOptions.vue'
import TelegramPreview from '@/components/posts/TelegramPreview.vue'
import { postsApi } from '@/api/posts.api'
import DateTimePicker from '@/components/scheduler/DateTimePicker.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const channelsStore = useChannelsStore()
const postsStore = usePostsStore()
const schedulerStore = useSchedulerStore()
const toast = useToastStore()
const locale = useLocaleStore()

const content = ref('')
const selectedChannelId = ref('')
const showScheduler = ref(false)
const showCrossPost = ref(false)
const publishing = ref(false)
const scheduling = ref(false)
const crossPosting = ref(false)
const mediaFiles = ref<File[]>([])
const uploadingMedia = ref(false)
const postOptions = ref({
  buttons: [] as import('@/types/post.types').PostButton[],
  poll: null as import('@/types/post.types').PostPoll | null,
  protectContent: false,
  pinAfterPublish: false,
  disableWebPreview: false,
})

onMounted(async () => {
  await channelsStore.fetchChannels()
  if (channelsStore.selectedChannelId) {
    selectedChannelId.value = channelsStore.selectedChannelId
  }
  const newsDraft = sessionStorage.getItem('news_draft')
  if (newsDraft) {
    content.value = newsDraft
    sessionStorage.removeItem('news_draft')
  }
})

async function createWithMedia(): Promise<string | null> {
  const post = await postsStore.createPost({
    channelId: selectedChannelId.value,
    content: content.value,
    ...postOptions.value,
  })
  if (!post) return null
  if (mediaFiles.value.length) {
    uploadingMedia.value = true
    try {
      await postsApi.uploadMedia(post.id, mediaFiles.value)
    } catch {
      toast.show(locale.t('createPost.mediaError'), 'error')
    } finally {
      uploadingMedia.value = false
    }
  }
  return post.id
}

async function saveDraft(): Promise<void> {
  if (!validate()) return
  try {
    const id = await createWithMedia()
    if (id) router.push({ name: 'home' })
  } catch {
    toast.show(locale.t('createPost.saveError'), 'error')
  }
}

async function publishNow(): Promise<void> {
  if (!validate()) return
  publishing.value = true
  try {
    const id = await createWithMedia()
    if (id) {
      await postsStore.publishPost(id)
      router.push({ name: 'home' })
    }
  } catch {
    toast.show(locale.t('createPost.publishError'), 'error')
  } finally {
    publishing.value = false
  }
}

async function onSchedule(scheduledAt: string): Promise<void> {
  if (!validate()) return
  scheduling.value = true
  try {
    const id = await createWithMedia()
    if (id) {
      await schedulerStore.schedulePost({ postId: id, scheduledAt })
      showScheduler.value = false
      router.push({ name: 'calendar' })
    }
  } catch {
    toast.show(locale.t('createPost.scheduleError'), 'error')
  } finally {
    scheduling.value = false
  }
}

function validate(): boolean {
  if (!selectedChannelId.value) {
    toast.show(locale.t('createPost.noChannel'), 'error')
    return false
  }
  if (!content.value.trim()) {
    toast.show(locale.t('createPost.noContent'), 'error')
    return false
  }
  if (content.value.length > 4096) {
    toast.show(locale.t('createPost.tooLong'), 'error')
    return false
  }
  return true
}

async function publishWithCrossPost(channelIds: string[]): Promise<void> {
  crossPosting.value = true
  try {
    const id = await createWithMedia()
    if (!id) return
    await postsStore.publishPost(id)
    await postsApi.crossPost(id, channelIds)
    showCrossPost.value = false
    toast.show(locale.t('createPost.crossPostSuccess'), 'success')
    router.push({ name: 'home' })
  } catch {
    toast.show(locale.t('createPost.crossPostError'), 'error')
  } finally {
    crossPosting.value = false
  }
}

const selectedChannelTitle = ref('')
function onChannelChange(e: Event): void {
  const select = e.target as HTMLSelectElement
  selectedChannelId.value = select.value
  selectedChannelTitle.value = select.options[select.selectedIndex]?.text ?? ''
}

const activeTab = ref<'editor' | 'preview'>('editor')
</script>

<template>
  <div class="create-post">
    <h1 class="create-post__title">{{ locale.t('createPost.title') }}</h1>

    <!-- Channel selector -->
    <div class="create-post__section">
      <label class="create-post__label">{{ locale.t('createPost.channelLabel') }}</label>
      <div class="create-post__channel-select">
        <AppIcon name="channels" :size="18" color="var(--fp-primary)" />
        <select
          :value="selectedChannelId"
          class="create-post__select"
          @change="onChannelChange"
        >
          <option value="" disabled>{{ locale.t('createPost.channelPlaceholder') }}</option>
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

    <!-- Tab switcher -->
    <div class="create-post__tabs">
      <button
        class="create-post__tab"
        :class="{ 'create-post__tab--active': activeTab === 'editor' }"
        @click="activeTab = 'editor'"
      >
        <AppIcon name="draft" :size="15" />
        {{ locale.t('createPost.tabEditor') }}
      </button>
      <button
        class="create-post__tab"
        :class="{ 'create-post__tab--active': activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ locale.t('createPost.tabPreview') }}
      </button>
    </div>

    <!-- Editor tab -->
    <template v-if="activeTab === 'editor'">
      <div class="create-post__section">
        <PostEditor
          v-model="content"
          :channel-id="selectedChannelId"
        />
      </div>

      <div class="create-post__section">
        <label class="create-post__label">{{ locale.t('createPost.mediaLabel') }}</label>
        <MediaUpload :uploading="uploadingMedia" @change="files => mediaFiles = files" />
      </div>

      <div class="create-post__section">
        <PostOptions v-model="postOptions" />
      </div>
    </template>

    <!-- Preview tab -->
    <div v-else class="create-post__section">
      <TelegramPreview
        :content="content"
        :media-files="mediaFiles"
        :buttons="postOptions.buttons"
        :poll="postOptions.poll"
        :channel-title="selectedChannelTitle || undefined"
      />
    </div>

    <!-- Action buttons -->
    <div class="create-post__actions">
      <div class="create-post__actions-row">
        <AppButton block :loading="publishing" @click="publishNow">
          <AppIcon name="rocket" :size="18" />
          {{ locale.t('createPost.publish') }}
        </AppButton>
      </div>
      <div class="create-post__actions-row create-post__actions-row--split">
        <AppButton block variant="secondary" @click="showScheduler = true">
          <AppIcon name="clock" :size="16" />
          {{ locale.t('createPost.schedule') }}
        </AppButton>
        <AppButton block variant="secondary" :loading="crossPosting" @click="showCrossPost = true">
          <AppIcon name="share" :size="16" />
          {{ locale.t('createPost.crossPost') }}
        </AppButton>
      </div>
      <AppButton block variant="ghost" @click="saveDraft">
        <AppIcon name="draft" :size="16" />
        {{ locale.t('createPost.draft') }}
      </AppButton>
    </div>

    <DateTimePicker
      v-if="showScheduler"
      :title="locale.t('createPost.scheduleTitle')"
      @close="showScheduler = false"
      @confirm="onSchedule"
    />

    <CrossPostModal
      v-if="showCrossPost"
      :channels="channelsStore.channels"
      :current-channel-id="selectedChannelId"
      :loading="crossPosting"
      @close="showCrossPost = false"
      @confirm="publishWithCrossPost"
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

/* Tabs */
.create-post__tabs {
  display: flex;
  gap: 4px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 4px;
  margin-bottom: 4px;
}

.create-post__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: calc(var(--fp-radius) - 2px);
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
}

.create-post__tab--active {
  background: var(--fp-bg);
  color: var(--fp-primary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
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
