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

const fileUrls = ref<string[]>([])

watch(
  () => props.mediaFiles,
  (files) => {
    fileUrls.value.forEach(u => URL.revokeObjectURL(u))
    fileUrls.value = (files ?? [])
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map(f => URL.createObjectURL(f))
  },
  { immediate: true },
)

onUnmounted(() => {
  fileUrls.value.forEach(u => URL.revokeObjectURL(u))
})

const isVideo = computed(() =>
  (props.mediaFiles ?? []).map(f => f.type.startsWith('video/')),
)

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
const hasMedia   = computed(() => fileUrls.value.length > 0)
const hasButtons = computed(() => (props.buttons ?? []).length > 0)
const hasPoll    = computed(() => !!props.poll?.question)
const isEmpty    = computed(() => !hasContent.value && !hasMedia.value && !hasButtons.value && !hasPoll.value)

const initials = computed(() => (props.channelTitle ?? 'C').charAt(0).toUpperCase())

const timeStr = computed(() => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

// Media grid layout class
const mediaClass = computed(() => {
  const n = fileUrls.value.length
  if (n === 1) return 'tg-media--single'
  if (n === 2) return 'tg-media--two'
  if (n === 3) return 'tg-media--three'
  return 'tg-media--four'
})
</script>

<template>
  <div class="tg-preview">
    <!-- Label -->
    <div class="tg-preview__label">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Предпросмотр в Telegram
    </div>

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

        <!-- Media grid -->
        <div v-if="hasMedia" class="tg-media" :class="mediaClass">
          <div
            v-for="(url, i) in fileUrls"
            :key="url"
            class="tg-media__item"
          >
            <video v-if="isVideo[i]" :src="url" class="tg-media__img" muted />
            <img v-else :src="url" class="tg-media__img" />
            <div v-if="isVideo[i]" class="tg-media__play">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
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
          <svg width="14" height="10" viewBox="0 0 16 11" fill="none" class="tg-bubble__read">
            <path d="M1 5.5L5 9.5L15 1.5" stroke="#4EABF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 5.5L9 9.5" stroke="#4EABF8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
  gap: 8px;
}

.tg-preview__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  letter-spacing: 0.3px;
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

.tg-media--single {
  grid-template-columns: 1fr;
}

.tg-media--two {
  grid-template-columns: 1fr 1fr;
}

.tg-media--three {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
}
.tg-media--three .tg-media__item:first-child {
  grid-column: 1 / -1;
}

.tg-media--four {
  grid-template-columns: 1fr 1fr;
}

.tg-media__item {
  position: relative;
  overflow: hidden;
  background: #141d26;
  aspect-ratio: 16/9;
}

.tg-media--single .tg-media__item {
  aspect-ratio: auto;
  max-height: 280px;
}

.tg-media__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tg-media--single .tg-media__img {
  max-height: 280px;
  height: auto;
  object-fit: contain;
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
