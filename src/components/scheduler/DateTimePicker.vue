<script setup lang="ts">
import { ref, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [isoDate: string]
}>()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()

const viewYear = ref(currentYear)
const viewMonth = ref(currentMonth)

const selectedDate = ref<string | null>(null)
const selectedHour = ref(12)
const selectedMinute = ref(0)

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const monthLabel = computed(() => `${MONTHS[viewMonth.value]} ${viewYear.value}`)

const calendarDays = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  let startDay = first.getDay() - 1
  if (startDay < 0) startDay = 6

  const days: Array<{ day: number; key: string; disabled: boolean } | null> = []

  for (let i = 0; i < startDay; i++) days.push(null)

  for (let d = 1; d <= lastDay; d++) {
    const key = formatKey(viewYear.value, viewMonth.value, d)
    const dateObj = new Date(viewYear.value, viewMonth.value, d, 23, 59)
    days.push({ day: d, key, disabled: dateObj < now })
  }

  return days
})

const todayKey = computed(() => formatKey(now.getFullYear(), now.getMonth(), now.getDate()))

function formatKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function prevMonth(): void {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth(): void {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDay(key: string): void {
  selectedDate.value = key
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const selectedDateTime = computed<Date | null>(() => {
  if (!selectedDate.value) return null
  const iso = `${selectedDate.value}T${pad(selectedHour.value)}:${pad(selectedMinute.value)}:00`
  return new Date(iso)
})

function onConfirm(): void {
  if (!selectedDateTime.value) return
  emit('confirm', selectedDateTime.value.toISOString())
}

const canConfirm = computed(() =>
  !!selectedDateTime.value && selectedDateTime.value > new Date(),
)
</script>

<template>
  <AppModal :title="title ?? 'Выберите дату и время'" @close="$emit('close')">
    <div class="dtp">
      <!-- Calendar -->
      <div class="dtp__calendar">
        <div class="dtp__nav">
          <button class="dtp__nav-btn" @click="prevMonth">
            <AppIcon name="chevron-left" :size="18" />
          </button>
          <span class="dtp__month">{{ monthLabel }}</span>
          <button class="dtp__nav-btn" @click="nextMonth">
            <AppIcon name="chevron-right" :size="18" />
          </button>
        </div>

        <div class="dtp__weekdays">
          <span v-for="wd in WEEKDAYS" :key="wd" class="dtp__wd">{{ wd }}</span>
        </div>

        <div class="dtp__days">
          <template v-for="(cell, i) in calendarDays" :key="i">
            <span v-if="!cell" class="dtp__day dtp__day--empty" />
            <button
              v-else
              class="dtp__day"
              :class="{
                'dtp__day--today': cell.key === todayKey,
                'dtp__day--selected': cell.key === selectedDate,
                'dtp__day--disabled': cell.disabled,
              }"
              :disabled="cell.disabled"
              @click="selectDay(cell.key)"
            >
              {{ cell.day }}
            </button>
          </template>
        </div>
      </div>

      <!-- Time picker -->
      <div class="dtp__time">
        <span class="dtp__time-label">
          <AppIcon name="clock" :size="18" />
          Время
        </span>
        <div class="dtp__time-selects">
          <select v-model.number="selectedHour" class="dtp__select">
            <option v-for="h in HOURS" :key="h" :value="h">{{ pad(h) }}</option>
          </select>
          <span class="dtp__colon">:</span>
          <select v-model.number="selectedMinute" class="dtp__select">
            <option v-for="m in MINUTES" :key="m" :value="m">{{ pad(m) }}</option>
          </select>
        </div>
      </div>

      <!-- Selected summary -->
      <div v-if="selectedDate" class="dtp__summary" :class="{ 'dtp__summary--error': selectedDateTime && selectedDateTime <= new Date() }">
        {{ selectedDate.split('-').reverse().join('.') }} в {{ pad(selectedHour) }}:{{ pad(selectedMinute) }}
        <span v-if="selectedDateTime && selectedDateTime <= new Date()" class="dtp__summary-warn"> — время в прошлом</span>
      </div>

      <AppButton block :disabled="!canConfirm" @click="onConfirm">
        Запланировать
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.dtp {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Navigation */
.dtp__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dtp__nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--fp-bg-secondary);
  color: var(--fp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--fp-transition);
}

.dtp__nav-btn:active {
  transform: scale(0.9);
  background: var(--fp-bg-tertiary);
}

.dtp__month {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-text);
}

/* Weekdays */
.dtp__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.dtp__wd {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  padding: 4px 0;
}

/* Days grid */
.dtp__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.dtp__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--fp-transition);
  background: none;
  color: var(--fp-text);
}

.dtp__day--empty {
  pointer-events: none;
}

.dtp__day--disabled {
  color: var(--fp-text-tertiary);
  opacity: 0.35;
}

.dtp__day--today:not(.dtp__day--selected) {
  background: var(--fp-bg-secondary);
  font-weight: 700;
}

.dtp__day--selected {
  background: var(--fp-primary);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.dtp__day:not(.dtp__day--disabled):not(.dtp__day--selected):active {
  background: var(--fp-bg-secondary);
  transform: scale(0.9);
}

/* Time picker */
.dtp__time {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
}

.dtp__time-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-text);
}

.dtp__time-selects {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dtp__select {
  padding: 8px 10px;
  background: var(--fp-bg);
  border-radius: var(--fp-radius-sm);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  appearance: none;
  min-width: 56px;
  color: var(--fp-text);
}

.dtp__colon {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text-tertiary);
}

/* Summary */
.dtp__summary {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--fp-primary);
  padding: 10px;
  background: var(--fp-primary-bg);
  border-radius: var(--fp-radius-sm);
}

.dtp__summary--error {
  color: var(--fp-error, #ef4444);
  background: rgba(239, 68, 68, 0.08);
}

.dtp__summary-warn {
  font-size: 12px;
  font-weight: 500;
}
</style>
