<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  published: number
  scheduled: number
  drafts: number
}>()

const total = computed(() => props.published + props.scheduled + props.drafts || 1)

function pct(val: number): string {
  return `${Math.round((val / total.value) * 100)}%`
}
</script>

<template>
  <div class="chart">
    <div class="chart__title">Распределение постов</div>
    <div class="chart__bars">
      <div class="chart__row">
        <span class="chart__label">Опубликовано</span>
        <div class="chart__bar-track">
          <div class="chart__bar chart__bar--published" :style="{ width: pct(published) }" />
        </div>
        <span class="chart__value">{{ published }}</span>
      </div>
      <div class="chart__row">
        <span class="chart__label">Запланировано</span>
        <div class="chart__bar-track">
          <div class="chart__bar chart__bar--scheduled" :style="{ width: pct(scheduled) }" />
        </div>
        <span class="chart__value">{{ scheduled }}</span>
      </div>
      <div class="chart__row">
        <span class="chart__label">Черновики</span>
        <div class="chart__bar-track">
          <div class="chart__bar chart__bar--drafts" :style="{ width: pct(drafts) }" />
        </div>
        <span class="chart__value">{{ drafts }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  padding: var(--fp-spacing);
  background: var(--tg-theme-secondary-bg-color);
  border-radius: var(--fp-radius);
}

.chart__title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: var(--fp-spacing);
}

.chart__bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart__row {
  display: grid;
  grid-template-columns: 100px 1fr 30px;
  align-items: center;
  gap: 10px;
}

.chart__label {
  font-size: 13px;
  color: var(--tg-theme-hint-color);
}

.chart__bar-track {
  height: 20px;
  background: var(--tg-theme-bg-color);
  border-radius: 10px;
  overflow: hidden;
}

.chart__bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.chart__bar--published { background: var(--fp-success); }
.chart__bar--scheduled { background: var(--fp-info); }
.chart__bar--drafts { background: var(--tg-theme-hint-color); }

.chart__value {
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}
</style>
