<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '@/stores/useTemplatesStore'
import { usePlanStore } from '@/stores/usePlanStore'
import { usePostsStore } from '@/stores/usePostsStore'
import { useChannelsStore } from '@/stores/useChannelsStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import TemplateCard from '@/components/templates/TemplateCard.vue'
import TemplateVarsModal from '@/components/templates/TemplateVarsModal.vue'
import TemplateFormModal from '@/components/templates/TemplateFormModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import type { Template, TemplateCategory } from '@/types/template.types'

const store = useTemplatesStore()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()
const planStore = usePlanStore()
const { t } = useLocaleStore()

function openCreate(): void {
  if (planStore.limits.templates === 0) {
    planStore.showPaywall('LIMIT_TEMPLATES')
    return
  }
  showCreateModal.value = true
}
const router = useRouter()

const selectedTemplate = ref<Template | null>(null)
const varsLoading = ref(false)
const showCreateModal = ref(false)

const CATEGORY_KEYS: Array<{ value: TemplateCategory | null; key: string }> = [
  { value: null, key: 'filterAll' },
  { value: 'announcement', key: 'categories.announcement' },
  { value: 'promo', key: 'categories.promo' },
  { value: 'educational', key: 'categories.educational' },
  { value: 'engagement', key: 'categories.engagement' },
  { value: 'news', key: 'categories.news' },
  { value: 'personal', key: 'categories.personal' },
]

onMounted(async () => {
  await Promise.all([store.getAll(), channelsStore.fetchChannels()])
})

async function handleUse(template: Template): Promise<void> {
  if (template.variables.length > 0) {
    selectedTemplate.value = template
  } else {
    await applyTemplate(template.id, {})
  }
}

async function applyTemplate(id: string, vars: Record<string, string>): Promise<void> {
  varsLoading.value = true
  const content = await store.useTemplate(id, vars)
  varsLoading.value = false
  if (!content) return

  await channelsStore.fetchChannels()
  const channelId = channelsStore.selectedChannelId ?? channelsStore.channels[0]?.id ?? ''
  const post = await postsStore.createPost({ channelId, content })
  if (post) {
    selectedTemplate.value = null
    router.push({ name: 'post-edit', params: { id: post.id } })
  }
}
</script>

<template>
  <div class="templates-page">
    <div class="templates-page__header">
      <h1 class="templates-page__title">{{ t('templates.title') }}</h1>
    </div>

    <!-- Category filter -->
    <div class="templates-page__filter">
      <button
        v-for="cat in CATEGORY_KEYS"
        :key="String(cat.value)"
        class="templates-page__chip"
        :class="{ 'templates-page__chip--active': store.activeCategory === cat.value }"
        @click="store.setCategory(cat.value)"
      >
        {{ t('templates.' + cat.key) }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="templates-page__loading">
      <span class="templates-page__spinner" />
    </div>

    <!-- Empty -->
    <div v-else-if="store.filtered.length === 0" class="templates-page__empty">
      <AppIcon name="draft" :size="48" />
      <p>{{ t('templates.noTemplates') }}</p>
      <button class="templates-page__empty-btn" @click="openCreate">{{ t('templates.createFirst') }}</button>
    </div>

    <!-- Grid -->
    <div v-else class="templates-page__grid">
      <TemplateCard
        v-for="template in store.filtered"
        :key="template.id"
        :template="template"
        @use="handleUse"
        @update="(id, payload) => store.update(id, payload)"
        @delete="store.remove"
      />
    </div>

    <!-- FAB -->
    <button class="templates-page__fab" @click="openCreate">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Vars modal -->
    <TemplateVarsModal
      v-if="selectedTemplate"
      :variables="selectedTemplate.variables"
      :loading="varsLoading"
      @apply="(vars) => applyTemplate(selectedTemplate!.id, vars)"
      @close="selectedTemplate = null"
    />

    <!-- Create modal -->
    <TemplateFormModal
      v-if="showCreateModal"
      @save="(payload) => { store.create(payload); showCreateModal = false }"
      @close="showCreateModal = false"
    />
  </div>
</template>

<style scoped>
.templates-page {
  padding-bottom: calc(var(--fp-bottom-nav-height, 72px) + 80px);
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.templates-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.templates-page__title {
  font-size: 24px;
  font-weight: 800;
  color: var(--fp-text);
  margin: 0;
}

/* Filter chips */
.templates-page__filter {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.templates-page__filter::-webkit-scrollbar { display: none; }

.templates-page__chip {
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--fp-bg-secondary);
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
  border: 1.5px solid transparent;
  flex-shrink: 0;
}

.templates-page__chip--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

/* Grid */
.templates-page__grid {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

/* Loading */
.templates-page__loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.templates-page__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--fp-bg-tertiary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Empty */
.templates-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: var(--fp-text-tertiary);
}

.templates-page__empty p {
  margin: 0;
  font-size: 15px;
}

.templates-page__empty-btn {
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-primary);
  padding: 8px 20px;
  border-radius: 20px;
  background: var(--fp-primary-bg);
}

/* FAB */
.templates-page__fab {
  position: sticky;
  bottom: calc(var(--fp-bottom-nav-height, 72px) + 16px);
  align-self: flex-end;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform var(--fp-transition);
  z-index: 10;
  margin-bottom: -56px;
}

.templates-page__fab:active {
  transform: scale(0.92);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
