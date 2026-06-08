<script setup lang="ts">
const props = defineProps<{ elapsedSeconds: number }>()
const emit = defineEmits<{
  'publish': []
  'schedule': []
  'close': []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="fgm-overlay" @click="emit('close')" />
    <div class="fgm">
      <div class="fgm__handle" />

      <div class="fgm__emoji">🎉</div>
      <h2 class="fgm__title">Первый пост готов!</h2>
      <p class="fgm__sub">AI написал его за {{ props.elapsedSeconds }} сек</p>
      <p class="fgm__text">Опубликуй его прямо сейчас — и начни свою серию 🔥</p>

      <div class="fgm__actions">
        <button class="fgm__btn fgm__btn--primary" @click="emit('publish')">
          ⚡ Опубликовать сейчас
        </button>
        <button class="fgm__btn fgm__btn--secondary" @click="emit('schedule')">
          🕐 Запланировать
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fgm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 300;
}

.fgm {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--fp-max-width);
  background: var(--fp-bg);
  border-radius: 20px 20px 0 0;
  padding: 12px 20px calc(max(env(safe-area-inset-bottom), 16px) + 16px);
  z-index: 301;
  text-align: center;
}

.fgm__handle {
  width: 36px;
  height: 4px;
  background: var(--fp-border);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.fgm__emoji {
  font-size: 52px;
  line-height: 1;
  margin-bottom: 12px;
}

.fgm__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--fp-text);
  margin: 0 0 6px;
}

.fgm__sub {
  font-size: 14px;
  color: var(--fp-primary);
  font-weight: 600;
  margin: 0 0 10px;
}

.fgm__text {
  font-size: 14px;
  color: var(--fp-text-secondary);
  line-height: 1.5;
  margin: 0 0 24px;
}

.fgm__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fgm__btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  transition: opacity 0.15s;
}
.fgm__btn:active { opacity: 0.8; }

.fgm__btn--primary {
  background: var(--fp-primary);
  color: #fff;
}

.fgm__btn--secondary {
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  border: 1.5px solid var(--fp-border);
}
</style>
