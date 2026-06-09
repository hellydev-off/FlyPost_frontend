<script setup lang="ts">
import { ref, computed } from "vue";
import type { PostButton, PostPoll } from "@/types/post.types";
import AppButton from "@/components/common/AppButton.vue";
import { useLocaleStore } from "@/stores/useLocaleStore";

const locale = useLocaleStore();

interface PostOptionsValue {
  buttons: PostButton[];
  poll: PostPoll | null;
  protectContent: boolean;
  pinAfterPublish: boolean;
  disableWebPreview: boolean;
}

const props = defineProps<{ modelValue: PostOptionsValue }>();
const emit = defineEmits<{ "update:modelValue": [v: PostOptionsValue] }>();

function update(patch: Partial<PostOptionsValue>) {
  emit("update:modelValue", { ...props.modelValue, ...patch });
}

const openSection = ref<"buttons" | "poll" | "params" | null>(null);
function toggleSection(s: "buttons" | "poll" | "params") {
  openSection.value = openSection.value === s ? null : s;
}

// ── Плавная анимация высоты ────────────────────────────────────────────────────
function onBeforeEnter(el: Element) {
  const e = el as HTMLElement;
  e.style.height = "0";
  e.style.overflow = "hidden";
  e.style.opacity = "0";
}
function onEnter(el: Element, done: () => void) {
  const e = el as HTMLElement;
  const h = e.scrollHeight;
  requestAnimationFrame(() => {
    e.style.transition =
      "height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease";
    e.style.height = h + "px";
    e.style.opacity = "1";
  });
  setTimeout(() => {
    e.style.height = "auto";
    e.style.overflow = "";
    done();
  }, 300);
}
function onBeforeLeave(el: Element) {
  const e = el as HTMLElement;
  e.style.height = e.scrollHeight + "px";
  e.style.overflow = "hidden";
}
function onLeave(el: Element, done: () => void) {
  const e = el as HTMLElement;
  requestAnimationFrame(() => {
    e.style.transition =
      "height 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.18s ease";
    e.style.height = "0";
    e.style.opacity = "0";
  });
  setTimeout(done, 240);
}

// ── Кнопки ────────────────────────────────────────────────────────────────────
const newBtnType = ref<"url" | "vote">("vote");
const newBtnText = ref("");
const newBtnUrl = ref("");

function addButton() {
  if (!newBtnText.value.trim()) return;
  if (newBtnType.value === "url" && !newBtnUrl.value.trim()) return;
  const btn: PostButton = {
    id: Math.random().toString(36).slice(2),
    text: newBtnText.value.trim(),
    type: newBtnType.value,
    url: newBtnType.value === "url" ? newBtnUrl.value.trim() : undefined,
    clickCount: 0,
  };
  update({ buttons: [...props.modelValue.buttons, btn] });
  newBtnText.value = "";
  newBtnUrl.value = "";
}

function removeButton(id: string) {
  update({ buttons: props.modelValue.buttons.filter((b) => b.id !== id) });
}

const canAddButton = computed(() => props.modelValue.buttons.length < 6);

// ── Опрос ─────────────────────────────────────────────────────────────────────
function togglePoll(val: boolean) {
  update({
    poll: val
      ? {
          question: "",
          options: ["", ""],
          isAnonymous: true,
          allowsMultipleAnswers: false,
        }
      : null,
  });
}

function updatePoll(patch: Partial<PostPoll>) {
  if (!props.modelValue.poll) return;
  update({ poll: { ...props.modelValue.poll, ...patch } });
}

function addOption() {
  if (!props.modelValue.poll || props.modelValue.poll.options.length >= 10)
    return;
  updatePoll({ options: [...props.modelValue.poll.options, ""] });
}

function removeOption(i: number) {
  if (!props.modelValue.poll || props.modelValue.poll.options.length <= 2)
    return;
  const opts = [...props.modelValue.poll.options];
  opts.splice(i, 1);
  updatePoll({ options: opts });
}

function setOption(i: number, val: string) {
  if (!props.modelValue.poll) return;
  const opts = [...props.modelValue.poll.options];
  opts[i] = val;
  updatePoll({ options: opts });
}
</script>

<template>
  <div class="po">
    <div class="po__label">{{ locale.t("postOptions.label") }}</div>

    <!-- ── КНОПКИ ─────────────────────────────────────────────── -->
    <div
      class="po__section"
      :class="{ 'po__section--open': openSection === 'buttons' }"
    >
      <button class="po__head" @click="toggleSection('buttons')">
        <span class="po__head-icon">
          <!-- Inline button icon -->
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="7" width="20" height="10" rx="5" />
            <path d="M8 12h8M12 9v6" />
          </svg>
        </span>
        <span class="po__head-title">{{
          locale.t("postOptions.buttons")
        }}</span>
        <span v-if="modelValue.buttons.length" class="po__badge">{{
          modelValue.buttons.length
        }}</span>
        <svg
          class="po__chevron"
          :class="{ 'po__chevron--open': openSection === 'buttons' }"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <div v-if="openSection === 'buttons'" class="po__body">
          <!-- Button list -->
          <div v-if="modelValue.buttons.length" class="po__btn-list">
            <div
              v-for="btn in modelValue.buttons"
              :key="btn.id"
              class="po__btn-item"
            >
              <span
                class="po__btn-icon"
                :class="
                  btn.type === 'url'
                    ? 'po__btn-icon--url'
                    : 'po__btn-icon--vote'
                "
              >
                <!-- Link icon -->
                <svg
                  v-if="btn.type === 'url'"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  />
                </svg>
                <!-- Vote icon -->
                <svg
                  v-else
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="6" height="10" rx="1" />
                  <rect x="9" y="7" width="6" height="14" rx="1" />
                  <rect x="15" y="3" width="6" height="18" rx="1" />
                </svg>
              </span>
              <div class="po__btn-meta">
                <span class="po__btn-name">{{ btn.text }}</span>
                <span v-if="btn.type === 'url'" class="po__btn-sub">{{
                  btn.url
                }}</span>
                <span v-else-if="btn.clickCount > 0" class="po__btn-sub"
                  >{{ btn.clickCount }}
                  {{ locale.t("postOptions.voteCount") }}</span
                >
              </div>
              <button class="po__remove" @click="removeButton(btn.id)">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Add form -->
          <div v-if="canAddButton" class="po__add-form">
            <div class="po__type-tabs">
              <button
                class="po__type-tab"
                :class="{ 'po__type-tab--active': newBtnType === 'vote' }"
                @click="newBtnType = 'vote'"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="6" height="10" rx="1" />
                  <rect x="9" y="7" width="6" height="14" rx="1" />
                  <rect x="15" y="3" width="6" height="18" rx="1" />
                </svg>
                {{ locale.t("postOptions.vote") }}
              </button>
              <button
                class="po__type-tab"
                :class="{ 'po__type-tab--active': newBtnType === 'url' }"
                @click="newBtnType = 'url'"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  />
                </svg>
                {{ locale.t("postOptions.link") }}
              </button>
            </div>
            <input
              v-model="newBtnText"
              class="po__input"
              :placeholder="locale.t('postOptions.btnPlaceholder')"
              @keydown.enter="addButton"
            />
            <input
              v-if="newBtnType === 'url'"
              v-model="newBtnUrl"
              class="po__input"
              :placeholder="locale.t('postOptions.urlPlaceholder')"
              @keydown.enter="addButton"
            />
            <button
              class="po__add-btn"
              :disabled="
                !newBtnText.trim() ||
                (newBtnType === 'url' && !newBtnUrl.trim())
              "
              @click="addButton"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ locale.t("postOptions.add") }}
            </button>
          </div>
          <p v-else class="po__hint">
            {{ locale.t("postOptions.maxButtons") }}
          </p>
        </div>
      </Transition>
    </div>

    <!-- ── ОПРОС ──────────────────────────────────────────────── -->
    <div
      class="po__section"
      :class="{ 'po__section--open': openSection === 'poll' }"
    >
      <button class="po__head" @click="toggleSection('poll')">
        <span class="po__head-icon">
          <!-- Poll icon -->
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M7 9h10M7 13h7" />
          </svg>
        </span>
        <span class="po__head-title">{{ locale.t("postOptions.poll") }}</span>
        <span v-if="modelValue.poll" class="po__badge po__badge--green">{{
          locale.t("postOptions.on")
        }}</span>
        <svg
          class="po__chevron"
          :class="{ 'po__chevron--open': openSection === 'poll' }"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <div v-if="openSection === 'poll'" class="po__body">
          <div v-if="!modelValue.poll" class="po__empty-poll">
            <p>{{ locale.t("postOptions.pollEmpty") }}</p>
            <button class="po__add-btn" @click="togglePoll(true)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ locale.t("postOptions.createPoll") }}
            </button>
          </div>

          <template v-else>
            <input
              :value="modelValue.poll.question"
              class="po__input"
              :placeholder="locale.t('postOptions.questionPlaceholder')"
              @input="
                updatePoll({
                  question: ($event.target as HTMLInputElement).value,
                })
              "
            />

            <div class="po__options">
              <div
                v-for="(opt, i) in modelValue.poll.options"
                :key="i"
                class="po__option"
              >
                <span class="po__option-num">{{ i + 1 }}</span>
                <input
                  :value="opt"
                  class="po__input po__input--flex"
                  :placeholder="`${locale.t('postOptions.optionPlaceholder')} ${i + 1}`"
                  @input="
                    setOption(i, ($event.target as HTMLInputElement).value)
                  "
                />
                <button
                  v-if="modelValue.poll.options.length > 2"
                  class="po__remove"
                  @click="removeOption(i)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              v-if="modelValue.poll.options.length < 10"
              class="po__add-option"
              @click="addOption"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {{ locale.t("postOptions.addOption") }}
            </button>

            <div class="po__checks">
              <label class="po__check">
                <input
                  type="checkbox"
                  :checked="modelValue.poll.isAnonymous"
                  @change="
                    updatePoll({
                      isAnonymous: ($event.target as HTMLInputElement).checked,
                    })
                  "
                />
                <span class="po__check-box" />
                <span class="po__check-label">{{
                  locale.t("postOptions.anonymous")
                }}</span>
              </label>
              <label class="po__check">
                <input
                  type="checkbox"
                  :checked="modelValue.poll.allowsMultipleAnswers"
                  @change="
                    updatePoll({
                      allowsMultipleAnswers: ($event.target as HTMLInputElement)
                        .checked,
                    })
                  "
                />
                <span class="po__check-box" />
                <span class="po__check-label">{{
                  locale.t("postOptions.multipleAnswers")
                }}</span>
              </label>
            </div>

            <button class="po__danger-link" @click="togglePoll(false)">
              {{ locale.t("postOptions.deletePoll") }}
            </button>
          </template>
        </div>
      </Transition>
    </div>

    <div
      class="po__section"
      :class="{ 'po__section--open': openSection === 'params' }"
    >
      <button class="po__head" @click="toggleSection('params')">
        <span class="po__head-icon">
          <!-- Settings sliders icon -->
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="var(--fp-bg-secondary)" />
            <circle cx="16" cy="12" r="2" fill="var(--fp-bg-secondary)" />
            <circle cx="10" cy="18" r="2" fill="var(--fp-bg-secondary)" />
          </svg>
        </span>
        <span class="po__head-title">{{ locale.t("postOptions.params") }}</span>
        <span
          v-if="
            modelValue.protectContent ||
            modelValue.pinAfterPublish ||
            modelValue.disableWebPreview
          "
          class="po__badge"
          >{{
            [
              modelValue.protectContent,
              modelValue.pinAfterPublish,
              modelValue.disableWebPreview,
            ].filter(Boolean).length
          }}</span
        >
        <svg
          class="po__chevron"
          :class="{ 'po__chevron--open': openSection === 'params' }"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <Transition
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
      >
        <div v-if="openSection === 'params'" class="po__body">
          <div class="po__param-list">
            <!-- Protect -->
            <div class="po__param">
              <div class="po__param-icon po__param-icon--lock">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </div>
              <div class="po__param-info">
                <span class="po__param-title">{{
                  locale.t("postOptions.protect")
                }}</span>
                <span class="po__param-desc">{{
                  locale.t("postOptions.protectDesc")
                }}</span>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.protectContent }"
                @click="update({ protectContent: !modelValue.protectContent })"
              >
                <span class="po__toggle-knob" />
              </button>
            </div>

            <!-- Pin -->
            <div class="po__param">
              <div class="po__param-icon po__param-icon--pin">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 2l3 7h-6l3-7zM12 9v13M9 16h6" />
                </svg>
              </div>
              <div class="po__param-info">
                <span class="po__param-title">{{
                  locale.t("postOptions.pin")
                }}</span>
                <span class="po__param-desc">{{
                  locale.t("postOptions.pinDesc")
                }}</span>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.pinAfterPublish }"
                @click="
                  update({ pinAfterPublish: !modelValue.pinAfterPublish })
                "
              >
                <span class="po__toggle-knob" />
              </button>
            </div>

            <!-- No web preview -->
            <div class="po__param">
              <div class="po__param-icon po__param-icon--nolink">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                  />
                  <path
                    d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </div>
              <div class="po__param-info">
                <span class="po__param-title">{{
                  locale.t("postOptions.noPreview")
                }}</span>
                <span class="po__param-desc">{{
                  locale.t("postOptions.noPreviewDesc")
                }}</span>
              </div>
              <button
                class="po__toggle"
                :class="{ 'po__toggle--on': modelValue.disableWebPreview }"
                @click="
                  update({ disableWebPreview: !modelValue.disableWebPreview })
                "
              >
                <span class="po__toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ── */
.po {
  border-radius: var(--fp-radius);
  background: var(--fp-bg-secondary);
  border: 1px solid var(--fp-border);
  overflow: hidden;
}

.po__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 12px 16px 8px;
}

/* ── Section ── */
.po__section {
  border-top: 1px solid var(--fp-border);
}
.po__section:first-of-type {
  border-top: none;
}

.po__head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
}
.po__head:active {
  background: rgba(0, 0, 0, 0.03);
}

.po__head-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
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
  text-align: left;
}

.po__badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
}
.po__badge--green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.po__chevron {
  color: var(--fp-text-tertiary);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}
.po__chevron--open {
  transform: rotate(180deg);
}

/* ── Body ── */
.po__body {
  padding: 4px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Input ── */
.po__input {
  width: 100%;
  padding: 11px 14px;
  background: var(--fp-bg);
  color: var(--fp-text);
  border: 1.5px solid var(--fp-border);
  border-radius: 10px;
  font-size: 14px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.po__input:focus {
  outline: none;
  border-color: var(--fp-primary);
  box-shadow: 0 0 0 3px var(--fp-primary-bg);
}
.po__input::placeholder {
  color: var(--fp-text-tertiary);
}
.po__input--flex {
  flex: 1;
}

/* ── Type tabs ── */
.po__type-tabs {
  display: flex;
  gap: 6px;
  padding: 3px;
  background: var(--fp-bg);
  border-radius: 10px;
  border: 1px solid var(--fp-border);
}
.po__type-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fp-text-secondary);
  transition: all 0.15s;
}
.po__type-tab--active {
  background: var(--fp-primary);
  color: #fff;
  font-weight: 600;
}

/* ── Add button ── */
.po__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px dashed var(--fp-border);
  background: transparent;
  color: var(--fp-primary);
  font-size: 13px;
  font-weight: 600;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.po__add-btn:not(:disabled):hover {
  background: var(--fp-primary-bg);
  border-color: var(--fp-primary);
}
.po__add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Add form ── */
.po__add-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Button list ── */
.po__btn-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.po__btn-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  background: var(--fp-bg);
  border-radius: 10px;
  border: 1px solid var(--fp-border);
}

.po__btn-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.po__btn-icon--url {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.po__btn-icon--vote {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.po__btn-meta {
  flex: 1;
  min-width: 0;
}
.po__btn-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--fp-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.po__btn-sub {
  display: block;
  font-size: 11px;
  color: var(--fp-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.po__remove {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: transparent;
  color: var(--fp-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.po__remove:active {
  background: var(--fp-bg-tertiary);
}

.po__hint {
  font-size: 12px;
  color: var(--fp-text-tertiary);
}

/* ── Poll empty ── */
.po__empty-poll {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.po__empty-poll p {
  font-size: 13px;
  color: var(--fp-text-tertiary);
}

/* ── Poll options ── */
.po__options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.po__option {
  display: flex;
  align-items: center;
  gap: 8px;
}
.po__option-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.po__add-option {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-primary);
  background: transparent;
  cursor: pointer;
  padding: 2px 0;
}

/* ── Checkboxes ── */
.po__checks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.po__check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.po__check input {
  display: none;
}
.po__check-box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--fp-border);
  background: var(--fp-bg);
  flex-shrink: 0;
  transition: all 0.15s;
  position: relative;
}
.po__check input:checked + .po__check-box {
  background: var(--fp-primary);
  border-color: var(--fp-primary);
}
.po__check input:checked + .po__check-box::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(40deg);
}
.po__check-label {
  font-size: 14px;
  color: var(--fp-text);
}

.po__danger-link {
  font-size: 13px;
  color: var(--fp-error);
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 2px 0;
}

/* ── Param list (toggles) ── */
.po__param-list {
  display: flex;
  flex-direction: column;
}
.po__param {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--fp-border);
}
.po__param:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.po__param-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.po__param-icon--lock {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.po__param-icon--pin {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.po__param-icon--nolink {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.po__param-info {
  flex: 1;
  min-width: 0;
}
.po__param-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--fp-text);
}
.po__param-desc {
  display: block;
  font-size: 11px;
  color: var(--fp-text-tertiary);
  margin-top: 1px;
}

/* ── Toggle switch ── */
.po__toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--fp-border);
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.po__toggle--on {
  background: var(--fp-primary);
}
.po__toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.po__toggle--on .po__toggle-knob {
  transform: translateX(20px);
}
</style>
