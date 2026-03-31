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
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
}

.chart__title {
  font-weight: 600;
  font-size: 15px;
  color: var(--fp-text);
  margin-bottom: var(--fp-spacing);
}

.chart__bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chart__row {
  display: grid;
  grid-template-columns: 100px 1fr 30px;
  align-items: center;
  gap: 10px;
}

.chart__label {
  font-size: 13px;
  color: var(--fp-text-secondary);
}

.chart__bar-track {
  height: 22px;
  background: var(--fp-bg);
  border-radius: 11px;
  overflow: hidden;
}

.chart__bar {
  height: 100%;
  border-radius: 11px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 4px;
}

.chart__bar--published {
  background: linear-gradient(90deg, var(--fp-success), #4ade80);
}
.chart__bar--scheduled {
  background: linear-gradient(90deg, var(--fp-primary), var(--fp-primary-light));
}
.chart__bar--drafts {
  background: linear-gradient(90deg, var(--fp-text-tertiary), var(--fp-text-secondary));
}

.chart__value {
  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: var(--fp-text);
}
</style>
