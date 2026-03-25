<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

const emit = defineEmits<{
  close: []
  add: [payload: { telegramChannelId: string; title: string }]
}>()

const title = ref('')
const username = ref('')

function onSubmit(): void {
  if (!title.value.trim()) return
  emit('add', {
    telegramChannelId: username.value.replace('@', '').trim(),
    title: title.value.trim(),
  })
}
</script>

<template>
  <AppModal title="Добавить канал" @close="$emit('close')">
    <div class="add-channel">
      <p class="add-channel__hint text-hint">
        1. Добавьте бота <strong>@flypost_bot</strong> как администратора вашего канала<br />
        2. Укажите название и username канала ниже
      </p>
      <AppInput v-model="title" label="Название канала" placeholder="Мой канал" />
      <AppInput v-model="username" label="Username канала" placeholder="@mychannel" />
      <AppButton block :disabled="!title.trim()" @click="onSubmit">
        Добавить
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
  line-height: 1.6;
}
</style>
