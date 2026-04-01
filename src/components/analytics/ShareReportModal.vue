<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import { generateReportCanvas, downloadCanvas } from '@/composables/useShareReport'
import type { ShareReportData } from '@/composables/useShareReport'

const props = defineProps<{ data: ShareReportData }>()
const emit = defineEmits<{ close: [] }>()

const previewSrc = ref('')

onMounted(() => {
  const canvas = generateReportCanvas(props.data)
  previewSrc.value = canvas.toDataURL('image/png')
})

function handleDownload(): void {
  const canvas = generateReportCanvas(props.data)
  const filename = `neopost-report-${props.data.channelUsername || 'channel'}.png`
  downloadCanvas(canvas, filename)
}
</script>

<template>
  <AppModal title="Отчёт канала" @close="emit('close')">
    <div class="share-report">
      <p class="share-report__hint">Скачайте PNG-карточку и поделитесь ей в любом мессенджере.</p>

      <div class="share-report__preview">
        <img
          v-if="previewSrc"
          :src="previewSrc"
          class="share-report__img"
          alt="Превью отчёта"
        />
        <div v-else class="share-report__placeholder" />
      </div>

      <AppButton class="share-report__btn" @click="handleDownload">
        Скачать PNG
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.share-report__hint {
  font-size: 13px;
  color: var(--fp-text-secondary);
  margin-bottom: 14px;
}

.share-report__preview {
  border-radius: var(--fp-radius);
  overflow: hidden;
  margin-bottom: 16px;
  background: #0f172a;
}

.share-report__img {
  width: 100%;
  display: block;
}

.share-report__placeholder {
  height: 140px;
}

.share-report__btn {
  width: 100%;
}
</style>
