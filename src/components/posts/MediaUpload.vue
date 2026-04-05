<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

const props = defineProps<{
  postId?: string        // если уже создан — сразу загружаем
  uploading?: boolean
}>()

const emit = defineEmits<{
  change: [files: File[]]
  upload: [files: File[]]
}>()

const { t } = useLocaleStore()
const files = ref<File[]>([])
const previews = ref<{ url: string; name: string; type: string; size: string }[]>([])
const dragOver = ref(false)

const ACCEPT = 'image/*,video/*,audio/*,application/pdf'
const MAX_FILES = 5
const MAX_SIZE = 50 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function fileIcon(type: string): string {
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  return 'draft'
}

function fileLabel(type: string): string {
  if (type.startsWith('image/')) return t('media.photo')
  if (type.startsWith('video/')) return t('media.video')
  if (type.startsWith('audio/')) return t('media.audio')
  return t('media.file')
}

function addFiles(incoming: FileList | null): void {
  if (!incoming) return
  const valid: File[] = []
  for (const f of Array.from(incoming)) {
    if (files.value.length + valid.length >= MAX_FILES) break
    if (f.size > MAX_SIZE) continue
    valid.push(f)
    const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : ''
    previews.value.push({ url, name: f.name, type: f.type, size: formatSize(f.size) })
  }
  files.value.push(...valid)
  emit('change', files.value)
}

function removeFile(i: number): void {
  if (previews.value[i].url) URL.revokeObjectURL(previews.value[i].url)
  files.value.splice(i, 1)
  previews.value.splice(i, 1)
  emit('change', files.value)
}

function onDrop(e: DragEvent): void {
  dragOver.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

function onInput(e: Event): void {
  addFiles((e.target as HTMLInputElement).files)
  ;(e.target as HTMLInputElement).value = ''
}

const canAdd = computed(() => files.value.length < MAX_FILES)
</script>

<template>
  <div class="media-upload">
    <!-- Превью загруженных файлов -->
    <div v-if="previews.length" class="media-upload__list">
      <div v-for="(p, i) in previews" :key="i" class="media-upload__item">
        <div class="media-upload__thumb">
          <img v-if="p.url" :src="p.url" :alt="p.name" />
          <div v-else class="media-upload__icon">
            <AppIcon :name="fileIcon(p.type)" :size="24" color="var(--fp-primary)" />
          </div>
        </div>
        <div class="media-upload__info">
          <span class="media-upload__name">{{ p.name }}</span>
          <span class="media-upload__meta">{{ fileLabel(p.type) }} · {{ p.size }}</span>
        </div>
        <button class="media-upload__remove" @click="removeFile(i)">
          <AppIcon name="close" :size="16" color="var(--fp-text-tertiary)" />
        </button>
      </div>
    </div>

    <!-- Зона drag&drop -->
    <div
      v-if="canAdd"
      class="media-upload__drop"
      :class="{ 'media-upload__drop--over': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <label class="media-upload__label">
        <input
          type="file"
          :accept="ACCEPT"
          multiple
          class="media-upload__input"
          @change="onInput"
        />
        <AppIcon name="attachment" :size="20" color="var(--fp-text-tertiary)" />
        <span>{{ previews.length ? t('media.addMore') : t('media.attach') }}</span>
        <span class="media-upload__hint">до {{ MAX_FILES }} {{ t('media.hint') }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.media-upload { display: flex; flex-direction: column; gap: 8px; }

.media-upload__list { display: flex; flex-direction: column; gap: 6px; }

.media-upload__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius-sm);
  border: 1px solid var(--fp-border);
}

.media-upload__thumb {
  width: 40px; height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--fp-bg-tertiary);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.media-upload__thumb img { width: 100%; height: 100%; object-fit: cover; }
.media-upload__icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

.media-upload__info { flex: 1; min-width: 0; }
.media-upload__name { display: block; font-size: 13px; color: var(--fp-text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.media-upload__meta { font-size: 11px; color: var(--fp-text-tertiary); }

.media-upload__remove {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--fp-transition);
}
.media-upload__remove:hover { background: var(--fp-bg-tertiary); }

.media-upload__drop {
  border: 1.5px dashed var(--fp-border);
  border-radius: var(--fp-radius);
  transition: border-color var(--fp-transition), background var(--fp-transition);
}
.media-upload__drop--over {
  border-color: var(--fp-primary);
  background: var(--fp-primary-bg);
}

.media-upload__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  cursor: pointer;
  font-size: 13px;
  color: var(--fp-text-secondary);
  text-align: center;
}
.media-upload__hint { font-size: 11px; color: var(--fp-text-tertiary); }
.media-upload__input { display: none; }
</style>
