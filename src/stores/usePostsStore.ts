import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postsApi } from '@/api/posts.api'
import { useToastStore } from './useToastStore'
import type { Post, CreatePostPayload, UpdatePostPayload, PostFilters } from '@/types/post.types'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const currentPost = ref<Post | null>(null)

  const draftPosts = computed(() => posts.value.filter(p => p.status === 'draft'))
  const publishedPosts = computed(() => posts.value.filter(p => p.status === 'published'))
  const scheduledPosts = computed(() => posts.value.filter(p => p.status === 'scheduled'))

  async function fetchPosts(filters?: PostFilters): Promise<void> {
    loading.value = true
    try {
      posts.value = await postsApi.getAll(filters)
    } catch {
      useToastStore().show('Не удалось загрузить посты', 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchPost(id: string): Promise<void> {
    loading.value = true
    try {
      currentPost.value = await postsApi.getOne(id)
    } catch {
      useToastStore().show('Пост не найден', 'error')
    } finally {
      loading.value = false
    }
  }

  async function createPost(payload: CreatePostPayload): Promise<Post | null> {
    try {
      const post = await postsApi.create(payload)
      posts.value.unshift(post)
      useToastStore().show('Черновик сохранён', 'success')
      return post
    } catch {
      useToastStore().show('Не удалось создать пост', 'error')
      return null
    }
  }

  async function updatePost(id: string, payload: UpdatePostPayload): Promise<void> {
    try {
      const updated = await postsApi.update(id, payload)
      const idx = posts.value.findIndex(p => p.id === id)
      if (idx !== -1) posts.value[idx] = updated
      if (currentPost.value?.id === id) currentPost.value = updated
      useToastStore().show('Пост обновлён', 'success')
    } catch {
      useToastStore().show('Не удалось обновить пост', 'error')
    }
  }

  async function publishPost(id: string): Promise<void> {
    try {
      const published = await postsApi.publish(id)
      const idx = posts.value.findIndex(p => p.id === id)
      if (idx !== -1) posts.value[idx] = published
      if (currentPost.value?.id === id) currentPost.value = published
      useToastStore().show('Пост опубликован!', 'success')
    } catch {
      useToastStore().show('Не удалось опубликовать пост', 'error')
    }
  }

  async function deletePost(id: string): Promise<void> {
    try {
      await postsApi.delete(id)
      posts.value = posts.value.filter(p => p.id !== id)
      if (currentPost.value?.id === id) currentPost.value = null
      useToastStore().show('Пост удалён', 'success')
    } catch {
      useToastStore().show('Не удалось удалить пост', 'error')
    }
  }

  return {
    posts, loading, currentPost,
    draftPosts, publishedPosts, scheduledPosts,
    fetchPosts, fetchPost, createPost, updatePost, publishPost, deletePost,
  }
})
