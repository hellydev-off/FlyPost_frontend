<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/usePostsStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { useSchedulerStore } from '@/stores/useSchedulerStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import PostEditor from '@/components/posts/PostEditor.vue'
import MediaUpload from '@/components/posts/MediaUpload.vue'
import CrossPostModal from '@/components/posts/CrossPostModal.vue'
import PostOptions from '@/components/posts/PostOptions.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import AppConfirm from '@/components/common/AppConfirm.vue'
import DateTimePicker from '@/components/scheduler/DateTimePicker.vue'
import { postsApi } from '@/api/posts.api'
import { useToastStore } from '@/stores/useToastStore'
import type { PostButton, PostPoll } from '@/types/post.types'

const props = defineProps<{ id: string }>()

const router = useRouter()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()
const schedulerStore = useSchedulerStore()


const toast = useToastStore()
const locale = useLocaleStore()
const content = ref('')
const saving = ref(false)
const postOptions = ref({
  buttons: [] as PostButton[],
  poll: null as PostPoll | null,
  protectContent: false,
  pinAfterPublish: false,
  disableWebPreview: false,
})
const showScheduler = ref(false)
const showCrossPost = ref(false)
const showDeleteConfirm = ref(false)
const crossPosting = ref(false)
const pendingMedia = ref<File[]>([])
const uploadingMedia = ref(false)

async function uploadPendingMedia(): Promise<void> {
  if (!pendingMedia.value.length) return
  uploadingMedia.value = true
  try {
    await postsApi.uploadMedia(props.id, pendingMedia.value)
    pendingMedia.value = []
  } catch {
    toast.show(locale.t('editPost.mediaError'), 'error')
  } finally {
    uploadingMedia.value = false
  }
}

onMounted(async () => {
  await channelsStore.fetchChannels()
  await postsStore.fetchPost(props.id)
  if (postsStore.currentPost) {
    content.value = postsStore.currentPost.content
    postOptions.value = {
      buttons: postsStore.currentPost.buttons ?? [],
      poll: postsStore.currentPost.poll ?? null,
      protectContent: postsStore.currentPost.protectContent ?? false,
      pinAfterPublish: postsStore.currentPost.pinAfterPublish ?? false,
      disableWebPreview: postsStore.currentPost.disableWebPreview ?? false,
    }
  }
})

async function save(): Promise<void> {
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value, ...postOptions.value })
    await uploadPendingMedia()
    toast.show(locale.t('editPost.saved'), 'success')
  } catch {
    toast.show(locale.t('editPost.saveError'), 'error')
  } finally {
    saving.value = false
  }
}

async function publish(): Promise<void> {
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value, ...postOptions.value })
    await uploadPendingMedia()
    await postsStore.publishPost(props.id)
    router.push({ name: 'home' })
  } catch {
    toast.show(locale.t('editPost.publishError'), 'error')
  } finally {
    saving.value = false
  }
}

async function schedule(isoDate: string): Promise<void> {
  showScheduler.value = false
  saving.value = true
  try {
    await postsStore.updatePost(props.id, { content: content.value, ...postOptions.value })
    await schedulerStore.schedulePost({ postId: props.id, scheduledAt: isoDate })
    router.push({ name: 'calendar' })
  } catch {
    toast.show(locale.t('editPost.scheduleError'), 'error')
  } finally {
    saving.value = false
  }
}

async function crossPost(channelIds: string[]): Promise<void> {
  crossPosting.value = true
  try {
    await postsApi.crossPost(props.id, channelIds)
    showCrossPost.value = false
    toast.show(locale.t('editPost.crossPostSuccess'), 'success')
  } catch {
    toast.show(locale.t('editPost.crossPostError'), 'error')
  } finally {
    crossPosting.value = false
  }
}

async function remove(): Promise<void> {
  showDeleteConfirm.value = false
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
      <h1>{{ locale.t('editPost.title') }}</h1>
    </div>

    <AppLoader v-if="postsStore.loading" />

    <template v-else-if="postsStore.currentPost">
      <div class="mt">
        <PostEditor
          v-model="content"
          :channel-id="postsStore.currentPost.channelId"
        />
      </div>

      <div class="mt">
        <MediaUpload
          :post-id="props.id"
          :uploading="uploadingMedia"
          @change="files => pendingMedia = files"
        />
      </div>

      <div class="mt">
        <PostOptions v-model="postOptions" />
      </div>

      <div class="edit-post__actions mt">
        <AppButton block :loading="saving" @click="save">
          <AppIcon name="check" :size="18" />
          {{ locale.t('editPost.save') }}
        </AppButton>
        <div class="edit-post__actions-row">
          <AppButton block variant="secondary" :loading="saving" @click="publish">
            <AppIcon name="rocket" :size="18" />
            {{ locale.t('editPost.publish') }}
          </AppButton>
          <AppButton block variant="secondary" :loading="saving" @click="showScheduler = true">
            <AppIcon name="clock" :size="18" />
            {{ locale.t('editPost.schedule') }}
          </AppButton>
        </div>
        <AppButton block variant="secondary" :loading="crossPosting" @click="showCrossPost = true">
          <AppIcon name="share" :size="18" />
          {{ locale.t('editPost.crossPost') }}
        </AppButton>
        <AppButton block variant="danger" @click="showDeleteConfirm = true">
          <AppIcon name="trash" :size="18" />
          {{ locale.t('editPost.delete') }}
        </AppButton>
      </div>
    </template>

    <div v-else class="edit-post__empty">
      <AppIcon name="draft" :size="48" color="var(--fp-text-tertiary)" />
      <p>{{ locale.t('editPost.notFound') }}</p>
    </div>

    <DateTimePicker
      v-if="showScheduler"
      :title="locale.t('editPost.scheduleTitle')"
      @close="showScheduler = false"
      @confirm="schedule"
    />

    <CrossPostModal
      v-if="showCrossPost && postsStore.currentPost"
      :channels="channelsStore.channels"
      :current-channel-id="postsStore.currentPost.channelId"
      :loading="crossPosting"
      @close="showCrossPost = false"
      @confirm="crossPost"
    />

    <AppConfirm
      v-if="showDeleteConfirm"
      :message="locale.t('editPost.deleteConfirm')"
      :confirm-label="locale.t('common.delete')"
      :cancel-label="locale.t('common.cancel')"
      danger
      @confirm="remove"
      @cancel="showDeleteConfirm = false"
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

.edit-post__section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  margin-bottom: 10px;
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
