<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/usePostsStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import PostEditor from '@/components/posts/PostEditor.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppLoader from '@/components/common/AppLoader.vue'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()

const content = ref('')
const saving = ref(false)

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

async function remove(): Promise<void> {
  await postsStore.deletePost(props.id)
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="edit-post">
    <h1>Редактирование</h1>

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
          Сохранить
        </AppButton>
        <AppButton block variant="secondary" :loading="saving" @click="publish">
          Опубликовать
        </AppButton>
        <AppButton block variant="danger" @click="remove">
          Удалить
        </AppButton>
      </div>
    </template>

    <div v-else class="text-center text-hint mt">
      Пост не найден
    </div>
  </div>
</template>

<style scoped>
.edit-post h1 {
  font-size: 24px;
  font-weight: 700;
}

.edit-post__actions {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}
</style>
