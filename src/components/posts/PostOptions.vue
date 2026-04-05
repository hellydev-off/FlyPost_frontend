<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PostButton, PostPoll } from '@/types/post.types'
import AppButton from '@/components/common/AppButton.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

const locale = useLocaleStore()

interface PostOptionsValue {
  buttons: PostButton[]
  poll: PostPoll | null
  protectContent: boolean
  pinAfterPublish: boolean
  disableWebPreview: boolean
}

const props = defineProps<{ modelValue: PostOptionsValue }>()
const emit = defineEmits<{ 'update:modelValue': [v: PostOptionsValue] }>()

function update(patch: Partial<PostOptionsValue>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const openSection = ref<'buttons' | 'poll' | 'params' | null>(null)
function toggleSection(s: 'buttons' | 'poll' | 'params') {
  openSection.value = openSection.value === s ? null : s
}

// Buttons
const newBtnType = ref<'url' | 'vote'>('vote')
const newBtnText = ref('')
const newBtnUrl = ref('')

function addButton() {
  if (!newBtnText.value.trim()) return
  if (newBtnType.value === 'url' && !newBtnUrl.value.trim()) return
  const btn: PostButton = {
    id: Math.random().toString(36).slice(2),
    text: newBtnText.value.trim(),
    type: newBtnType.value,
    url: newBtnType.value === 'url' ? newBtnUrl.value.trim() : undefined,
    clickCount: 0,
  }
  update({ buttons: [...props.modelValue.buttons, btn] })
  newBtnText.value = ''
  newBtnUrl.value = ''
}

function removeButton(id: string) {
  update({ buttons: props.modelValue.buttons.filter(b => b.id !== id) })
}

const canAddButton = computed(() => props.modelValue.buttons.length < 6)

// Poll
function togglePoll(val: boolean) {
  update({
    poll: val ? { question: '', options: ['', ''], isAnonymous: true, allowsMultipleAnswers: false } : null,
  })
}

function updatePoll(patch: Partial<PostPoll>) {
  if (!props.modelValue.poll) return
  update({ poll: { ...props.modelValue.poll, ...patch } })
}

function addOption() {
  if (!props.modelValue.poll || props.modelValue.poll.options.length >= 10) return
  updatePoll({ options: [...props.modelValue.poll.options, ''] })
}

function removeOption(i: number) {
  if (!props.modelValue.poll || props.modelValue.poll.options.length <= 2) return
  const opts = [...props.modelValue.poll.options]
  opts.splice(i, 1)
  updatePoll({ options: opts })
}

function setOption(i: number, val: string) {
  if (!props.modelValue.poll) return
  const opts = [...props.modelValue.poll.options]
  opts[i] = val
  updatePoll({ options: opts })
}
</script>

<template>
  <div class="po">
    <div class="po__label">{{ locale.t('postOptions.label') }}</div>

    <!-- ───── КНОПКИ ───── -->
    <div class="po__section" :class="{ 'po__section--open': openSection === 'buttons' }">
      <button class="po__head" @click="toggleSection('buttons')">
        <span class="po__head-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="10" rx="5" stroke="currentColor" stroke-width="1.8"/>
            <path d="M8 12h8M12 9v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="po__head-title">{{ locale.t('postOptions.buttons') }}</span>
        <span v-if="modelValue.buttons.length" class="po__chip po__chip--active">{{ modelValue.buttons.length }}</span>
        <span class="po__head-arrow" :class="{ 'po__head-arrow--open': openSection === 'buttons' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="po__chevron">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <Transition name="po-slide">
        <div v-if="openSection === 'buttons'" class="po__body">
          <!-- Empty state -->
          <div v-if="!modelValue.buttons.length" class="po__empty">
            <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
              <rect x="1" y="1" width="42" height="30" rx="7" fill="var(--fp-primary-bg)" stroke="var(--fp-primary)" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="4 3"/>
              <rect x="9" y="10" width="26" height="12" rx="6" fill="var(--fp-primary-bg)"/>
              <path d="M17 16h10M22 13v6" stroke="var(--fp-primary)" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>
            </svg>
            <p>{{ locale.t('postOptions.buttonsEmpty') }}</p>
          </div>

          <!-- Button list -->
          <div v-if="modelValue.buttons.length" class="po__btn-list">
            <div v-for="btn in modelValue.buttons" :key="btn.id" class="po__btn-item">
              <span class="po__btn-emoji">{{ btn.type === 'url' ? '🔗' : '🗳️' }}</span>
              <div class="po__btn-meta">
                <span class="po__btn-name">{{ btn.text }}</span>
                <span v-if="btn.type === 'url'" class="po__btn-sub">{{ btn.url }}</span>
                <span v-else-if="btn.clickCount > 0" class="po__btn-sub">{{ btn.clickCount }} {{ locale.t('postOptions.voteCount') }}</span>
              </div>
              <button class="po__remove" @click="removeButton(btn.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Add form -->
          <div v-if="canAddButton" class="po__add-form">
            <div class="po__chips">
              <button
                class="po__chip"
                :class="{ 'po__chip--active': newBtnType === 'vote' }"
                @click="newBtnType = 'vote'"
              >{{ locale.t('postOptions.vote') }}</button>
              <button
                class="po__chip"
                :class="{ 'po__chip--active': newBtnType === 'url' }"
                @click="newBtnType = 'url'"
              >{{ locale.t('postOptions.link') }}</button>
            </div>
            <input v-model="newBtnText" class="po__input" :placeholder="locale.t('postOptions.btnPlaceholder')" @keydown.enter="addButton" />
            <input v-if="newBtnType === 'url'" v-model="newBtnUrl" class="po__input" :placeholder="locale.t('postOptions.urlPlaceholder')" @keydown.enter="addButton" />
            <AppButton variant="secondary" @click="addButton">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ locale.t('postOptions.add') }}
            </AppButton>
          </div>
          <p v-else class="po__hint">{{ locale.t('postOptions.maxButtons') }}</p>
        </div>
      </Transition>
    </div>

    <!-- ───── ОПРОС ───── -->
    <div class="po__section" :class="{ 'po__section--open': openSection === 'poll' }">
      <button class="po__head" @click="toggleSection('poll')">
        <span class="po__head-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/>
            <path d="M7 9h10M7 13h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="po__head-title">{{ locale.t('postOptions.poll') }}</span>
        <span v-if="modelValue.poll" class="po__chip po__chip--active">{{ locale.t('postOptions.on') }}</span>
        <span class="po__head-arrow" :class="{ 'po__head-arrow--open': openSection === 'poll' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="po__chevron">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <Transition name="po-slide">
        <div v-if="openSection === 'poll'" class="po__body">
          <div v-if="!modelValue.poll" class="po__empty">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
              <rect x="1" y="1" width="46" height="30" rx="7" fill="var(--fp-primary-bg)" stroke="var(--fp-primary)" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="4 3"/>
              <rect x="7" y="7" width="34" height="4" rx="2" fill="var(--fp-primary)" fill-opacity=".2"/>
              <rect x="7" y="15" width="20" height="3" rx="1.5" fill="var(--fp-primary)" fill-opacity=".35"/>
              <rect x="7" y="22" width="26" height="3" rx="1.5" fill="var(--fp-primary)" fill-opacity=".2"/>
            </svg>
            <p>{{ locale.t('postOptions.pollEmpty') }}</p>
            <AppButton variant="secondary" size="sm" @click="togglePoll(true)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ locale.t('postOptions.createPoll') }}
            </AppButton>
          </div>

          <template v-else>
            <input
              :value="modelValue.poll.question"
              class="po__input"
              :placeholder="locale.t('postOptions.questionPlaceholder')"
              @input="updatePoll({ question: ($event.target as HTMLInputElement).value })"
            />

            <div class="po__options">
              <div v-for="(opt, i) in modelValue.poll.options" :key="i" class="po__option">
                <span class="po__option-num">{{ i + 1 }}</span>
                <input
                  :value="opt"
                  class="po__input po__input--flex"
                  :placeholder="`${locale.t('postOptions.optionPlaceholder')} ${i + 1}`"
                  @input="setOption(i, ($event.target as HTMLInputElement).value)"
                />
                <button
                  v-if="modelValue.poll.options.length > 2"
                  class="po__remove"
                  @click="removeOption(i)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <button v-if="modelValue.poll.options.length < 10" class="po__add-option" @click="addOption">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ locale.t('postOptions.addOption') }}
            </button>

            <div class="po__checks">
              <label class="po__check">
                <input type="checkbox" :checked="modelValue.poll.isAnonymous" @change="updatePoll({ isAnonymous: ($event.target as HTMLInputElement).checked })" />
                <span class="po__check-box" />
                <span class="po__check-label">{{ locale.t('postOptions.anonymous') }}</span>
              </label>
              <label class="po__check">
                <input type="checkbox" :checked="modelValue.poll.allowsMultipleAnswers" @change="updatePoll({ allowsMultipleAnswers: ($event.target as HTMLInputElement).checked })" />
                <span class="po__check-box" />
                <span class="po__check-label">{{ locale.t('postOptions.multipleAnswers') }}</span>
              </label>
            </div>

            <button class="po__danger-link" @click="togglePoll(false)">{{ locale.t('postOptions.deletePoll') }}</button>
          </template>
        </div>
      </Transition>
    </div>

    <!-- ───── ПАРАМЕТРЫ ───── -->
    <div class="po__section" :class="{ 'po__section--open': openSection === 'params' }">
      <button class="po__head" @click="toggleSection('params')">
        <span class="po__head-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="po__head-title">{{ locale.t('postOptions.params') }}</span>
        <span
          v-if="modelValue.protectContent || modelValue.pinAfterPublish || modelValue.disableWebPreview"
          class="po__chip po__chip--active"
        >
          {{ [modelValue.protectContent, modelValue.pinAfterPublish, modelValue.disableWebPreview].filter(Boolean).length }}
        </span>
        <span class="po__head-arrow" :class="{ 'po__head-arrow--open': openSection === 'params' }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="po__chevron">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <Transition name="po-slide">
        <div v-if="openSection === 'params'" class="po__body">
          <div class="po__param-list">
            <label class="po__param">
              <div class="po__param-info">
                <span class="po__param-emoji">🔒</span>
                <div>
                  <span class="po__param-title">{{ locale.t('postOptions.protect') }}</span>
                  <span class="po__param-desc">{{ locale.t('postOptions.protectDesc') }}</span>
                </div>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.protectContent }"
                @click="update({ protectContent: !modelValue.protectContent })"
              >
                <span class="po__toggle-knob" />
              </button>
            </label>

            <label class="po__param">
              <div class="po__param-info">
                <span class="po__param-emoji">📌</span>
                <div>
                  <span class="po__param-title">{{ locale.t('postOptions.pin') }}</span>
                  <span class="po__param-desc">{{ locale.t('postOptions.pinDesc') }}</span>
                </div>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.pinAfterPublish }"
                @click="update({ pinAfterPublish: !modelValue.pinAfterPublish })"
              >
                <span class="po__toggle-knob" />
              </button>
            </label>

            <label class="po__param">
              <div class="po__param-info">
                <span class="po__param-emoji">🔗</span>
                <div>
                  <span class="po__param-title">{{ locale.t('postOptions.noPreview') }}</span>
                  <span class="po__param-desc">{{ locale.t('postOptions.noPreviewDesc') }}</span>
                </div>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.disableWebPreview }"
                @click="update({ disableWebPreview: !modelValue.disableWebPreview })"
              >
                <span class="po__toggle-knob" />
              </button>
            </label>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.po {
  border-radius: var(--fp-radius);
  background: var(--fp-bg-secondary);
  overflow: hidden;
}

.po__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-secondary);
  padding: 12px 16px 8px;
}

/* Section */
.po__section {
  border-top: 1px solid var(--fp-border);
}

.po__head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  background: transparent;
  cursor: pointer;
  transition: background var(--fp-transition);
  text-align: left;
}
.po__head:active { background: var(--fp-bg-tertiary); }

.po__head-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--fp-radius-sm);
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.po__head-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text);
}

.po__head-arrow {
  transition: transform 0.25s ease;
  color: var(--fp-text-tertiary);
}
.po__head-arrow--open { transform: rotate(180deg); }

.po__chevron { display: block; }

/* Chip */
.po__chip {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: var(--fp-bg-tertiary);
  color: var(--fp-text-secondary);
  border: 1.5px solid transparent;
  transition: all var(--fp-transition);
}
.po__chip--active {
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  border-color: var(--fp-primary);
}

/* Body */
.po__body {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

/* Slide transition */
.po-slide-enter-active { transition: all 0.25s ease; }
.po-slide-leave-active { transition: all 0.2s ease; }
.po-slide-enter-from,
.po-slide-leave-to { opacity: 0; transform: translateY(-6px); }

/* Empty state */
.po__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 0 4px;
  text-align: center;
}
.po__empty p {
  font-size: 13px;
  color: var(--fp-text-tertiary);
  line-height: 1.5;
  max-width: 220px;
}

/* Button list */
.po__btn-list { display: flex; flex-direction: column; gap: 6px; }

.po__btn-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--fp-bg);
  border-radius: var(--fp-radius-sm);
  border: 1px solid var(--fp-border);
}
.po__btn-emoji { font-size: 16px; line-height: 1; flex-shrink: 0; }
.po__btn-meta { flex: 1; min-width: 0; }
.po__btn-name { display: block; font-size: 13px; font-weight: 500; color: var(--fp-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.po__btn-sub { display: block; font-size: 11px; color: var(--fp-text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.po__remove {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: transparent;
  color: var(--fp-text-tertiary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background var(--fp-transition);
}
.po__remove:hover { background: var(--fp-bg-tertiary); }

/* Chips row (type selector) */
.po__chips { display: flex; gap: 8px; flex-wrap: wrap; }
.po__add-form { display: flex; flex-direction: column; gap: 8px; }

/* Input — matches AppInput style */
.po__input {
  width: 100%;
  padding: 13px 16px;
  background: var(--fp-bg);
  color: var(--fp-text);
  border: 1.5px solid transparent;
  border-radius: var(--fp-radius);
  font-size: 15px;
  transition: all var(--fp-transition);
}
.po__input:focus {
  outline: none;
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
}
.po__input::placeholder { color: var(--fp-text-tertiary); }
.po__input--flex { flex: 1; }

.po__hint { font-size: 12px; color: var(--fp-text-tertiary); }

/* Poll options */
.po__options { display: flex; flex-direction: column; gap: 6px; }
.po__option { display: flex; align-items: center; gap: 8px; }
.po__option-num {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.po__add-option {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600;
  color: var(--fp-primary);
  padding: 4px 0;
  background: transparent;
  cursor: pointer;
}

/* Custom checkboxes */
.po__checks { display: flex; flex-direction: column; gap: 10px; }
.po__check { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.po__check input { display: none; }
.po__check-box {
  width: 18px; height: 18px; border-radius: 5px;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg);
  flex-shrink: 0;
  transition: all var(--fp-transition);
  position: relative;
}
.po__check input:checked + .po__check-box {
  background: var(--fp-primary);
  border-color: var(--fp-primary);
}
.po__check input:checked + .po__check-box::after {
  content: '';
  position: absolute;
  left: 4px; top: 1px;
  width: 5px; height: 9px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(40deg);
}
.po__check-label { font-size: 14px; color: var(--fp-text); }

.po__danger-link {
  font-size: 13px; color: var(--fp-error);
  background: transparent; cursor: pointer;
  text-align: left; padding: 2px 0;
}

/* Param toggles */
.po__param-list { display: flex; flex-direction: column; }
.po__param {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--fp-border);
  cursor: pointer;
}
.po__param:last-child { border-bottom: none; }
.po__param-info { display: flex; align-items: center; gap: 12px; }
.po__param-emoji { font-size: 18px; width: 28px; text-align: center; }
.po__param-title { display: block; font-size: 14px; font-weight: 500; color: var(--fp-text); }
.po__param-desc { display: block; font-size: 12px; color: var(--fp-text-tertiary); margin-top: 2px; }

/* Toggle switch */
.po__toggle {
  width: 44px; height: 24px;
  border-radius: 12px;
  background: var(--fp-bg-tertiary);
  border: none; cursor: pointer;
  position: relative; flex-shrink: 0;
  transition: background 0.25s ease;
}
.po__toggle--on { background: var(--fp-primary); }
.po__toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.po__toggle--on .po__toggle-knob { transform: translateX(20px); }
</style>
