<script setup lang="ts">
import { ref } from 'vue'
import AppTextarea from '@/components/common/AppTextarea.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import { aiApi, type GeneratePayload } from '@/api/ai.api'
import { useToastStore } from '@/stores/useToastStore'

const props = defineProps<{
  modelValue: string
  channelId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

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
    useToastStore().show('Не удалось сгенерировать текст', 'error')
  } finally {
    aiLoading.value = false
  }
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

    <AppButton variant="ghost" size="sm" @click="showAiModal = true">
      &#x2728; Сгенерировать с AI
    </AppButton>

    <div v-if="modelValue" class="post-editor__preview">
      <div class="post-editor__preview-label text-hint">Превью:</div>
      <div class="post-editor__preview-text">{{ modelValue }}</div>
    </div>

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
  </div>
</template>

<style scoped>
.post-editor {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-sm);
}

.post-editor__preview {
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
}

.post-editor__preview-label {
  font-size: 12px;
  margin-bottom: var(--fp-spacing-sm);
}

.post-editor__preview-text {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.ai-form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.ai-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing-xs);
}

.ai-form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--tg-theme-hint-color);
}

.ai-form__input {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
}

.ai-form__input:focus {
  box-shadow: 0 0 0 2px var(--tg-theme-button-color);
}

.ai-form__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-form__chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--tg-theme-secondary-bg-color);
  color: var(--tg-theme-text-color);
  transition: all var(--fp-transition);
}

.ai-form__chip--active {
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
}
</style>
