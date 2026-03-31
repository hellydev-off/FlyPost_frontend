<script setup lang="ts">
import { ref, computed } from 'vue'
import AppTextarea from '@/components/common/AppTextarea.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { aiApi, type GeneratePayload, type ImproveAction } from '@/api/ai.api'
import { useToastStore } from '@/stores/useToastStore'
import TemplatePickerModal from './TemplatePickerModal.vue'

const props = defineProps<{
  modelValue: string
  channelId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const toast = useToastStore()

// --- Templates ---
const showTemplatesModal = ref(false)

function onTemplatePick(content: string): void {
  emit('update:modelValue', content)
  showTemplatesModal.value = false
}

// --- Generate ---
const showAiModal = ref(false)
const aiLoading = ref(false)
const aiTopic = ref('')
const aiTone = ref<GeneratePayload['tone']>('neutral')
const aiLength = ref<GeneratePayload['length']>('medium')

const toneOptions = [
  { value: 'neutral', label: 'Нейтральный' },
  { value: 'expert', label: 'Экспертный' },
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'sales', label: 'Продающий' },
] as const

const lengthOptions = [
  { value: 'short', label: 'Короткий' },
  { value: 'medium', label: 'Средний' },
  { value: 'long', label: 'Длинный' },
] as const

async function generateAi(): Promise<void> {
  if (!aiTopic.value.trim()) return
  aiLoading.value = true
  try {
    const result = await aiApi.generate({
      topic: aiTopic.value,
      tone: aiTone.value,
      length: aiLength.value,
      channelId: props.channelId,
    })
    emit('update:modelValue', result.content)
    showAiModal.value = false
    aiTopic.value = ''
  } catch {
    toast.show('Не удалось сгенерировать текст', 'error')
  } finally {
    aiLoading.value = false
  }
}

// --- Improve ---
const improveLoading = ref<ImproveAction | null>(null)
const showToneModal = ref(false)
const improveTone = ref('дружелюбный')

const hasContent = computed(() => props.modelValue.trim().length > 0)

const improveActions: Array<{ action: ImproveAction; icon: string; label: string }> = [
  { action: 'shorten', icon: 'scissors', label: 'Сократить' },
  { action: 'expand', icon: 'expand', label: 'Расширить' },
  { action: 'rephrase', icon: 'refresh', label: 'Перефразировать' },
  { action: 'fix', icon: 'check', label: 'Исправить' },
  { action: 'tone', icon: 'mask', label: 'Сменить тон' },
]

const tonePresets = [
  'дружелюбный',
  'экспертный',
  'продающий',
  'формальный',
  'юмористический',
  'мотивирующий',
]

async function runImprove(action: ImproveAction, tone?: string): Promise<void> {
  if (!hasContent.value) {
    toast.show('Сначала напишите текст', 'error')
    return
  }
  improveLoading.value = action
  try {
    const result = await aiApi.improve({
      content: props.modelValue,
      action,
      tone,
    })
    emit('update:modelValue', result.content)
    if (action === 'tone') showToneModal.value = false
    toast.show('Текст улучшен', 'success')
  } catch {
    toast.show('Не удалось улучшить текст', 'error')
  } finally {
    improveLoading.value = null
  }
}

function onImproveClick(action: ImproveAction): void {
  if (action === 'tone') {
    showToneModal.value = true
    return
  }
  runImprove(action)
}
</script>

<template>
  <div class="post-editor">
    <AppTextarea
      :model-value="modelValue"
      placeholder="Текст поста..."
      :max-length="4096"
      :rows="8"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- AI toolbar -->
    <div class="ai-toolbar">
      <button class="ai-toolbar__gen" @click="showAiModal = true">
        <AppIcon name="sparkles" :size="16" />
        <span>Сгенерировать</span>
      </button>
      <button class="ai-toolbar__tpl" @click="showTemplatesModal = true">
        <AppIcon name="template" :size="16" />
        <span>Шаблоны</span>
      </button>
      <span class="ai-toolbar__divider" />
      <button
        v-for="item in improveActions"
        :key="item.action"
        class="ai-toolbar__btn"
        :class="{ 'ai-toolbar__btn--loading': improveLoading === item.action }"
        :disabled="!hasContent || improveLoading !== null"
        :title="item.label"
        @click="onImproveClick(item.action)"
      >
        <span v-if="improveLoading === item.action" class="ai-toolbar__spinner" />
        <AppIcon v-else :name="item.icon" :size="16" />
      </button>
    </div>

    <!-- Preview -->
    <div v-if="modelValue" class="post-editor__preview">
      <div class="post-editor__preview-header">
        <span class="post-editor__preview-label">Превью</span>
        <span class="post-editor__char-count">
          {{ modelValue.length }} / 4096
        </span>
      </div>
      <div class="post-editor__preview-text">{{ modelValue }}</div>
    </div>

    <!-- Generate modal -->
    <AppModal v-if="showAiModal" title="AI-генерация" @close="showAiModal = false">
      <div class="ai-form">
        <div class="ai-form__field">
          <label class="ai-form__label">Тема поста</label>
          <input
            v-model="aiTopic"
            class="ai-form__input"
            placeholder="О чём написать?"
          />
        </div>

        <div class="ai-form__field">
          <label class="ai-form__label">Тон</label>
          <div class="ai-form__chips">
            <button
              v-for="opt in toneOptions"
              :key="opt.value"
              class="ai-form__chip"
              :class="{ 'ai-form__chip--active': aiTone === opt.value }"
              @click="aiTone = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="ai-form__field">
          <label class="ai-form__label">Длина</label>
          <div class="ai-form__chips">
            <button
              v-for="opt in lengthOptions"
              :key="opt.value"
              class="ai-form__chip"
              :class="{ 'ai-form__chip--active': aiLength === opt.value }"
              @click="aiLength = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <AppButton
          block
          :loading="aiLoading"
          :disabled="!aiTopic.trim()"
          @click="generateAi"
        >
          Сгенерировать
        </AppButton>
      </div>
    </AppModal>

    <!-- Templates picker -->
    <TemplatePickerModal
      v-if="showTemplatesModal"
      @pick="onTemplatePick"
      @close="showTemplatesModal = false"
    />

    <!-- Tone modal -->
    <AppModal v-if="showToneModal" title="Сменить тон" @close="showToneModal = false">
      <div class="tone-form">
        <div class="tone-form__presets">
          <button
            v-for="preset in tonePresets"
            :key="preset"
            class="tone-form__preset"
            :class="{ 'tone-form__preset--active': improveTone === preset }"
            @click="improveTone = preset"
          >
            {{ preset }}
          </button>
        </div>

        <div class="tone-form__custom">
          <input
            v-model="improveTone"
            class="ai-form__input"
            placeholder="Или введите свой тон..."
          />
        </div>

        <AppButton
          block
          :loading="improveLoading === 'tone'"
          :disabled="!improveTone.trim()"
          @click="runImprove('tone', improveTone)"
        >
          Применить тон
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

/* AI Toolbar */
.ai-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ai-toolbar__gen {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  color: #fff;
  transition: all var(--fp-transition);
}

.ai-toolbar__gen:active {
  transform: scale(0.95);
}

.ai-toolbar__tpl {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--fp-bg);
  color: var(--fp-text-secondary);
  border: 1.5px solid var(--fp-border);
  transition: all var(--fp-transition);
}

.ai-toolbar__tpl:active {
  transform: scale(0.95);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

.ai-toolbar__divider {
  width: 1px;
  height: 24px;
  background: var(--fp-border);
  flex-shrink: 0;
  margin: 0 4px;
}

.ai-toolbar__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fp-bg);
  color: var(--fp-text-secondary);
  transition: all var(--fp-transition);
  flex-shrink: 0;
}

.ai-toolbar__btn:active:not(:disabled) {
  transform: scale(0.9);
  color: var(--fp-primary);
}

.ai-toolbar__btn:disabled {
  opacity: 0.3;
}

.ai-toolbar__btn--loading {
  pointer-events: none;
}

.ai-toolbar__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--fp-bg-tertiary);
  border-top-color: var(--fp-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Preview */
.post-editor__preview {
  padding: var(--fp-spacing);
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border-left: 3px solid var(--fp-primary);
}

.post-editor__preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--fp-spacing-sm);
}

.post-editor__preview-label {
  font-size: 12px;
  color: var(--fp-text-secondary);
  font-weight: 600;
}

.post-editor__char-count {
  font-size: 11px;
  color: var(--fp-text-tertiary);
  font-variant-numeric: tabular-nums;
}

.post-editor__preview-text {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: var(--fp-text);
}

/* AI Form (generate) */
.ai-form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.ai-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
}

.ai-form__input {
  padding: 13px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 15px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.ai-form__input:focus {
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
  background: var(--fp-bg);
}

.ai-form__input::placeholder {
  color: var(--fp-text-tertiary);
}

.ai-form__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-form__chip {
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  transition: all var(--fp-transition);
  border: 1.5px solid transparent;
}

.ai-form__chip--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

.ai-form__chip:active {
  transform: scale(0.95);
}

/* Tone form */
.tone-form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.tone-form__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tone-form__preset {
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  text-transform: capitalize;
  transition: all var(--fp-transition);
  border: 1.5px solid transparent;
}

.tone-form__preset--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

.tone-form__preset:active {
  transform: scale(0.95);
}

.tone-form__custom {
  position: relative;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
