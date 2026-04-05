<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'
import { useLocaleStore } from '@/stores/useLocaleStore'

const emit = defineEmits<{
  close: []
  add: [payload: { telegramChannelId: string; title: string }]
}>()

const { t } = useLocaleStore()
const title = ref('')
const username = ref('')

function onSubmit(): void {
  if (!title.value.trim() || !username.value.trim()) return
  const raw = username.value.trim()
  const channelId = raw.startsWith('-') ? raw : raw.startsWith('@') ? raw : `@${raw}`
  emit('add', {
    telegramChannelId: channelId,
    title: title.value.trim(),
  })
}
</script>

<template>
  <AppModal :title="t('channelAdd.title')" @close="$emit('close')">
    <div class="add-channel">
      <div class="add-channel__hint">
        <div class="add-channel__step">
          <span class="add-channel__step-num">1</span>
          <span>{{ t('channelAdd.step1') }}</span>
        </div>
        <div class="add-channel__step">
          <span class="add-channel__step-num">2</span>
          <span>{{ t('channelAdd.step2') }}</span>
        </div>
      </div>
      <AppInput v-model="title" :label="t('channelAdd.titleLabel')" :placeholder="t('channelAdd.titlePlaceholder')" />
      <AppInput v-model="username" :label="t('channelAdd.usernameLabel')" :placeholder="t('channelAdd.usernamePlaceholder')" />
      <AppButton block :disabled="!title.trim()" @click="onSubmit">
        {{ t('channelAdd.submit') }}
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.add-channel {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.add-channel__hint {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-channel__step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fp-text-secondary);
}

.add-channel__step strong {
  color: var(--fp-primary);
}

.add-channel__step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--fp-primary-bg);
  color: var(--fp-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
