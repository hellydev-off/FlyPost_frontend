<script setup lang="ts">
import { computed, watch, ref, onUnmounted } from 'vue'
import type { PostButton, PostPoll } from '@/types/post.types'

const props = defineProps<{
  content: string
  mediaFiles?: File[]
  buttons?: PostButton[] | null
  poll?: PostPoll | null
  channelTitle?: string
}>()

// ── Object URLs for preview ───────────────────────────────────────────────────

interface MediaItem { url: string; type: 'image' | 'video' }
interface FileItem  { name: string; size: string; kind: 'audio' | 'document' }

const mediaItems = ref<MediaItem[]>([])
const fileItems  = ref<FileItem[]>([])

function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

watch(
  () => (props.mediaFiles ?? []).map(f => f.name + f.size + f.lastModified).join(','),
  () => {
    mediaItems.value.forEach(m => URL.revokeObjectURL(m.url))
    mediaItems.value = []
    fileItems.value  = []

    for (const f of (props.mediaFiles ?? [])) {
      if (f.type.startsWith('image/')) {
        mediaItems.value.push({ url: URL.createObjectURL(f), type: 'image' })
      } else if (f.type.startsWith('video/')) {
        mediaItems.value.push({ url: URL.createObjectURL(f), type: 'video' })
      } else if (f.type.startsWith('audio/')) {
        fileItems.value.push({ name: f.name, size: fmtSize(f.size), kind: 'audio' })
      } else {
        fileItems.value.push({ name: f.name, size: fmtSize(f.size), kind: 'document' })
      }
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  mediaItems.value.forEach(m => URL.revokeObjectURL(m.url))
})

// ── Telegram Markdown → HTML ──────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderMarkdown(raw: string): string {
  let s = escapeHtml(raw)

  // Code blocks (```...```)
  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre class="tg-pre"><code>${code.trim()}</code></pre>`,
  )

  // Inline code
  s = s.replace(/`([^`\n]+)`/g, '<code class="tg-code">$1</code>')

  // Bold **text** or *text*
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
  s = s.replace(/\*([^*\n]+)\*/g, '<b>$1</b>')

  // Underline __text__
  s = s.replace(/__([^_\n]+)__/g, '<u>$1</u>')

  // Italic _text_
  s = s.replace(/_([^_\n]+)_/g, '<i>$1</i>')

  // Strikethrough ~~text~~
  s = s.replace(/~~([^~\n]+)~~/g, '<s>$1</s>')

  // Links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a class="tg-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  // Newlines → <br>
  s = s.replace(/\n/g, '<br>')

  return s
}

const renderedContent = computed(() =>
  props.content ? renderMarkdown(props.content) : '',
)

// ── State ─────────────────────────────────────────────────────────────────────

const hasContent = computed(() => props.content.trim().length > 0)
const hasMedia   = computed(() => mediaItems.value.length > 0)
const hasFiles   = computed(() => fileItems.value.length > 0)
const hasButtons = computed(() => (props.buttons ?? []).length > 0)
const hasPoll    = computed(() => !!props.poll?.question)
const isEmpty    = computed(() => !hasContent.value && !hasMedia.value && !hasFiles.value && !hasButtons.value && !hasPoll.value)

const initials = computed(() => (props.channelTitle ?? 'C').charAt(0).toUpperCase())

const timeStr = computed(() => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

// Media grid layout class
const mediaClass = computed(() => {
  const n = mediaItems.value.length
  if (n === 1) return 'tg-media--single'
  if (n === 2) return 'tg-media--two'
  if (n === 3) return 'tg-media--three'
  if (n === 4) return 'tg-media--four'
  return 'tg-media--many'
})
</script>

<template>
  <div class="tg-preview">
    <!-- Feed wrapper (Telegram wallpaper feeling) -->
    <div class="tg-feed">

      <!-- Empty state -->
      <div v-if="isEmpty" class="tg-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" opacity=".3">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Начни вводить текст</span>
      </div>

      <!-- Message bubble -->
      <div v-else class="tg-bubble">

        <!-- Channel header -->
        <div class="tg-bubble__header">
          <div class="tg-bubble__avatar">{{ initials }}</div>
          <div class="tg-bubble__channel">{{ channelTitle || 'Канал' }}</div>
        </div>

        <!-- Media grid (images + videos) -->
        <div v-if="hasMedia" class="tg-media" :class="mediaClass">
          <div
            v-for="item in mediaItems"
            :key="item.url"
            class="tg-media__item"
          >
            <video v-if="item.type === 'video'" :src="item.url" class="tg-media__img" muted />
            <img v-else :src="item.url" class="tg-media__img" />
            <div v-if="item.type === 'video'" class="tg-media__play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>

        <!-- File attachments (audio, documents) -->
        <div v-if="hasFiles" class="tg-files">
          <div v-for="(f, i) in fileItems" :key="i" class="tg-file">
            <div class="tg-file__icon" :class="`tg-file__icon--${f.kind}`">
              <!-- Audio icon -->
              <svg v-if="f.kind === 'audio'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
              <!-- Document icon -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="tg-file__info">
              <span class="tg-file__name">{{ f.name }}</span>
              <span class="tg-file__meta">{{ f.kind === 'audio' ? 'Аудио' : 'Документ' }} · {{ f.size }}</span>
            </div>
          </div>
        </div>

        <!-- Text content -->
        <div
          v-if="hasContent"
          class="tg-bubble__text"
          :class="{ 'tg-bubble__text--no-media': !hasMedia }"
          v-html="renderedContent"
        />

        <!-- Inline buttons -->
        <div v-if="hasButtons" class="tg-buttons">
          <a
            v-for="btn in buttons"
            :key="btn.id"
            class="tg-btn"
            :class="btn.type === 'url' ? 'tg-btn--url' : 'tg-btn--vote'"
            :href="btn.type === 'url' ? btn.url : undefined"
            target="_blank"
            rel="noopener"
          >
            <span v-if="btn.type === 'url'" class="tg-btn__icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </span>
            <span v-else class="tg-btn__icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ btn.text }}
            <span v-if="btn.clickCount > 0" class="tg-btn__count">{{ btn.clickCount }}</span>
          </a>
        </div>

        <!-- Poll -->
        <div v-if="hasPoll" class="tg-poll">
          <div class="tg-poll__badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M7 9h10M7 13h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ poll!.isAnonymous ? 'Анонимный опрос' : 'Публичный опрос' }}
          </div>
          <p class="tg-poll__question">{{ poll!.question || 'Вопрос опроса' }}</p>
          <div class="tg-poll__options">
            <div
              v-for="(opt, i) in poll!.options.filter(o => o.trim())"
              :key="i"
              class="tg-poll__opt"
            >
              <div class="tg-poll__opt-circle" />
              <span class="tg-poll__opt-text">{{ opt }}</span>
            </div>
            <div v-if="poll!.options.filter(o => !o.trim()).length" class="tg-poll__opt tg-poll__opt--empty">
              <div class="tg-poll__opt-circle tg-poll__opt-circle--empty" />
              <span class="tg-poll__opt-text tg-poll__opt-text--empty">...</span>
            </div>
          </div>
          <div v-if="poll!.allowsMultipleAnswers" class="tg-poll__multi">Можно выбрать несколько</div>
        </div>

        <!-- Timestamp -->
        <div class="tg-bubble__footer">
          <span class="tg-bubble__time">{{ timeStr }}</span>
          <!-- Telegram double checkmark (read receipts) -->
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" class="tg-bubble__read">
            <!-- Back check -->
            <path d="M1 6L4.5 9.5L10.5 1.5" stroke="#4EABF8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
            <!-- Front check (offset right by 4px) -->
            <path d="M5 6L8.5 9.5L14.5 1.5" stroke="#4EABF8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ── */
.tg-preview {
  display: flex;
  flex-direction: column;
}

/* ── Feed (wallpaper bg) ── */
.tg-feed {
  border-radius: var(--fp-radius);
  background: #1a1f2e;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(74,144,226,0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(74,144,226,0.04) 0%, transparent 50%);
  padding: 16px 12px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* ── Empty ── */
.tg-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  font-size: 13px;
  opacity: 0.4;
  width: 100%;
  min-height: 100px;
}

/* ── Bubble ── */
.tg-bubble {
  background: #212d3b;
  border-radius: 12px 12px 2px 12px;
  overflow: hidden;
  max-width: 95%;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* ── Header ── */
.tg-bubble__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 6px;
}

.tg-bubble__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A90E2, #1e6fd0);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-bubble__channel {
  font-size: 13px;
  font-weight: 700;
  color: #4eabf8;
}

/* ── Media grid ── */
.tg-media {
  display: grid;
  gap: 2px;
  overflow: hidden;
}

/* 1 file — full width, natural aspect ratio */
.tg-media--single { grid-template-columns: 1fr; }
.tg-media--single .tg-media__item {
  aspect-ratio: auto;
  max-height: 300px;
}
.tg-media--single .tg-media__img {
  max-height: 300px;
  height: auto;
  object-fit: contain;
}

/* 2 files — side by side */
.tg-media--two { grid-template-columns: 1fr 1fr; }
.tg-media--two .tg-media__item { aspect-ratio: 1/1; }

/* 3 files — first full width, two below */
.tg-media--three {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
}
.tg-media--three .tg-media__item:first-child {
  grid-column: 1 / -1;
  aspect-ratio: 16/9;
}
.tg-media--three .tg-media__item:not(:first-child) { aspect-ratio: 1/1; }

/* 4 files — 2×2 grid */
.tg-media--four { grid-template-columns: 1fr 1fr; }
.tg-media--four .tg-media__item { aspect-ratio: 1/1; }

/* 5+ files — 3-column grid */
.tg-media--many { grid-template-columns: 1fr 1fr 1fr; }
.tg-media--many .tg-media__item { aspect-ratio: 1/1; }
.tg-media--many .tg-media__item:first-child {
  grid-column: 1 / -1;
  aspect-ratio: 16/9;
}

/* Base item */
.tg-media__item {
  position: relative;
  overflow: hidden;
  background: #141d26;
  aspect-ratio: 16/9;
}

.tg-media__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tg-media__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.3);
  color: #fff;
}

/* ── Text ── */
.tg-bubble__text {
  padding: 6px 12px 2px;
  font-size: 14px;
  line-height: 1.55;
  color: #e8eaf0;
  word-break: break-word;
}

.tg-bubble__text--no-media {
  padding-top: 2px;
}

/* Markdown styles */
.tg-bubble__text :deep(b) { font-weight: 700; color: #ffffff; }
.tg-bubble__text :deep(i) { font-style: italic; color: #c8d0e0; }
.tg-bubble__text :deep(u) { text-decoration: underline; }
.tg-bubble__text :deep(s) { text-decoration: line-through; opacity: 0.6; }
.tg-bubble__text :deep(.tg-code) {
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 1px 5px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: #a8daff;
}
.tg-bubble__text :deep(.tg-pre) {
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 6px 0;
  overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #a8daff;
  white-space: pre;
}
.tg-bubble__text :deep(.tg-link) {
  color: #5cb8ff;
  text-decoration: none;
}

/* ── File attachments ── */
.tg-files {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px 2px;
}

.tg-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.tg-file__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.tg-file__icon--audio    { background: #3b82f6; }
.tg-file__icon--document { background: #10b981; }

.tg-file__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tg-file__name {
  font-size: 13px;
  font-weight: 600;
  color: #e8eaf0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tg-file__meta {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

/* ── Inline Buttons ── */
.tg-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 8px 6px;
}

.tg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  background: rgba(74, 171, 248, 0.12);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #4eabf8;
  text-decoration: none;
  transition: background 0.15s;
  cursor: pointer;
  border: 1px solid rgba(74, 171, 248, 0.2);
}

.tg-btn:active { background: rgba(74, 171, 248, 0.2); }

.tg-btn--url { color: #5cb8ff; }
.tg-btn--vote { color: #7dd3fc; }

.tg-btn__icon { display: flex; align-items: center; opacity: 0.7; }
.tg-btn__count {
  margin-left: auto;
  font-size: 11px;
  background: rgba(74,171,248,0.2);
  padding: 2px 6px;
  border-radius: 10px;
}

/* ── Poll ── */
.tg-poll {
  padding: 8px 12px 6px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.tg-poll__badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #4eabf8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  opacity: 0.8;
}

.tg-poll__question {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.4;
}

.tg-poll__options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tg-poll__opt {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tg-poll__opt-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(74, 171, 248, 0.6);
  flex-shrink: 0;
}

.tg-poll__opt-circle--empty {
  border-color: rgba(255,255,255,0.15);
}

.tg-poll__opt-text {
  font-size: 13px;
  color: #c8d0e0;
}

.tg-poll__opt-text--empty {
  color: rgba(255,255,255,0.2);
  font-style: italic;
}

.tg-poll__multi {
  margin-top: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}

/* ── Footer / Timestamp ── */
.tg-bubble__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 4px 10px 8px;
}

.tg-bubble__time {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
}

.tg-bubble__read {
  opacity: 0.8;
}
</style>
