<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useChannelProfileStore } from '@/stores/useChannelProfileStore'

const props = defineProps<{ channelId: string; channelTitle: string }>()
const emit = defineEmits<{ close: [] }>()

const store = useChannelProfileStore()

const TONE_PRESETS = ['Экспертный', 'Дружелюбный', 'Продающий', 'Нейтральный', 'Юмористический', 'Вдохновляющий']

const form = reactive({
  tone: '' as string,
  audience: '',
  topics: [] as string[],
  forbiddenWords: [] as string[],
  examples: '',
})
const topicInput = ref('')
const forbiddenInput = ref('')
const saving = ref(false)

onMounted(async () => {
  await store.fetch(props.channelId)
  const p = store.getProfile(props.channelId)
  if (p) {
    form.tone = p.tone ?? ''
    form.audience = p.audience ?? ''
    form.topics = [...p.topics]
    form.forbiddenWords = [...p.forbiddenWords]
    form.examples = p.examples ?? ''
  }
})

function addTopic(): void {
  const val = topicInput.value.trim()
  if (val && !form.topics.includes(val)) form.topics.push(val)
  topicInput.value = ''
}

function removeTopic(i: number): void {
  form.topics.splice(i, 1)
}

function addForbidden(): void {
  const val = forbiddenInput.value.trim()
  if (val && !form.forbiddenWords.includes(val)) form.forbiddenWords.push(val)
  forbiddenInput.value = ''
}

function removeForbidden(i: number): void {
  form.forbiddenWords.splice(i, 1)
}

async function handleSave(): Promise<void> {
  saving.value = true
  await store.save(props.channelId, {
    tone: form.tone || null,
    audience: form.audience || null,
    topics: form.topics,
    forbiddenWords: form.forbiddenWords,
    examples: form.examples || null,
  })
  saving.value = false
  emit('close')
}
</script>

<template>
  <AppModal :title="`Голос: ${channelTitle}`" @close="emit('close')">
    <div class="voice-form">
      <p class="voice-form__desc">
        AI будет использовать этот профиль при генерации и улучшении постов для канала.
      </p>

      <!-- Tone -->
      <div class="voice-form__section">
        <label class="voice-form__label">Тон голоса</label>
        <div class="voice-form__presets">
          <button
            v-for="preset in TONE_PRESETS"
            :key="preset"
            class="voice-form__chip"
            :class="{ 'voice-form__chip--active': form.tone === preset }"
            @click="form.tone = form.tone === preset ? '' : preset"
          >
            {{ preset }}
          </button>
        </div>
        <input
          v-model="form.tone"
          class="voice-form__input"
          placeholder="Или введите свой тон..."
        />
      </div>

      <!-- Audience -->
      <div class="voice-form__section">
        <label class="voice-form__label">Целевая аудитория</label>
        <input
          v-model="form.audience"
          class="voice-form__input"
          placeholder="Например: предприниматели 25-40 лет, интересующиеся маркетингом"
        />
      </div>

      <!-- Topics -->
      <div class="voice-form__section">
        <label class="voice-form__label">Ключевые темы</label>
        <div class="voice-form__tags">
          <span
            v-for="(t, i) in form.topics"
            :key="t"
            class="voice-form__tag"
            @click="removeTopic(i)"
          >{{ t }} ×</span>
        </div>
        <div class="voice-form__tag-input">
          <input
            v-model="topicInput"
            class="voice-form__input"
            placeholder="Добавить тему..."
            @keydown.enter.prevent="addTopic"
          />
          <button class="voice-form__add-btn" @click="addTopic">+</button>
        </div>
      </div>

      <!-- Forbidden words -->
      <div class="voice-form__section">
        <label class="voice-form__label">Запрещённые слова</label>
        <div class="voice-form__tags">
          <span
            v-for="(w, i) in form.forbiddenWords"
            :key="w"
            class="voice-form__tag voice-form__tag--danger"
            @click="removeForbidden(i)"
          >{{ w }} ×</span>
        </div>
        <div class="voice-form__tag-input">
          <input
            v-model="forbiddenInput"
            class="voice-form__input"
            placeholder="Добавить слово..."
            @keydown.enter.prevent="addForbidden"
          />
          <button class="voice-form__add-btn" @click="addForbidden">+</button>
        </div>
      </div>

      <!-- Examples -->
      <div class="voice-form__section">
        <label class="voice-form__label">Примеры лучших постов</label>
        <textarea
          v-model="form.examples"
          class="voice-form__textarea"
          rows="5"
          placeholder="Вставьте 1-3 своих лучших поста — AI будет ориентироваться на этот стиль"
        />
      </div>

      <AppButton block :loading="saving" @click="handleSave">
        Сохранить профиль
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.voice-form {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.voice-form__desc {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.voice-form__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voice-form__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--fp-text-secondary);
}

.voice-form__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.voice-form__chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}

.voice-form__chip--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

.voice-form__chip:active { transform: scale(0.95); }

.voice-form__input {
  padding: 11px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 14px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
  width: 100%;
  box-sizing: border-box;
}

.voice-form__input:focus {
  border-color: var(--fp-primary);
  background: var(--fp-bg);
  outline: none;
}

.voice-form__input::placeholder { color: var(--fp-text-tertiary); }

.voice-form__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 10px;
}

.voice-form__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  cursor: pointer;
  transition: opacity var(--fp-transition);
}

.voice-form__tag:active { opacity: 0.6; }

.voice-form__tag--danger {
  background: var(--fp-error-bg, #fff0f0);
  color: var(--fp-error, #e53935);
}

.voice-form__tag-input {
  display: flex;
  gap: 8px;
}

.voice-form__add-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--fp-radius);
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}

.voice-form__add-btn:active { transform: scale(0.92); }

.voice-form__textarea {
  padding: 11px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  font-size: 14px;
  color: var(--fp-text);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.voice-form__textarea:focus {
  border-color: var(--fp-primary);
  background: var(--fp-bg);
  outline: none;
}

.voice-form__textarea::placeholder { color: var(--fp-text-tertiary); }
</style>
