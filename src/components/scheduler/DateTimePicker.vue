<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [isoDate: string]
}>()

const dateTime = ref('')

function onConfirm(): void {
  if (!dateTime.value) return
  emit('confirm', new Date(dateTime.value).toISOString())
}
</script>

<template>
  <AppModal :title="title ?? 'Выберите дату и время'" @close="$emit('close')">
    <div class="dt-picker">
      <input
        v-model="dateTime"
        type="datetime-local"
        class="dt-picker__input"
      />
      <AppButton block :disabled="!dateTime" @click="onConfirm">
        Подтвердить
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.dt-picker {
  display: flex;
  flex-direction: column;
  gap: var(--fp-spacing);
}

.dt-picker__input {
  padding: 12px 14px;
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
  font-size: 15px;
  width: 100%;
}
</style>
