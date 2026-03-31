<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const onboarding = useOnboardingStore()

onMounted(() => {
  onboarding.load()
})

function goToStep(route: object): void {
  router.push(route)
}
</script>

<template>
  <div class="onboarding">
    <div class="onboarding__header">
      <div class="onboarding__title-row">
        <span class="onboarding__title">Начало работы</span>
        <span class="onboarding__counter">{{ onboarding.doneCount }}/{{ onboarding.steps.length }}</span>
      </div>
      <button class="onboarding__dismiss" @click="onboarding.dismiss()">
        <AppIcon name="close" :size="16" />
      </button>
    </div>

    <div class="onboarding__progress-track">
      <div
        class="onboarding__progress-fill"
        :style="{ width: (onboarding.doneCount / onboarding.steps.length * 100) + '%' }"
      />
    </div>

    <div class="onboarding__steps">
      <button
        v-for="(step, i) in onboarding.steps"
        :key="step.key"
        class="onboarding__step"
        :class="{ 'onboarding__step--done': step.done }"
        @click="goToStep(step.route)"
      >
        <div class="onboarding__step-icon" :class="{ 'onboarding__step-icon--done': step.done }">
          <AppIcon v-if="step.done" name="check" :size="14" color="#fff" />
          <span v-else class="onboarding__step-num">{{ i + 1 }}</span>
        </div>
        <span class="onboarding__step-label">{{ step.label }}</span>
        <AppIcon name="chevron-right" :size="16" color="var(--fp-text-tertiary)" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  padding: 16px;
  margin-bottom: var(--fp-spacing);
}

.onboarding__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.onboarding__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.onboarding__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--fp-text);
}

.onboarding__counter {
  font-size: 12px;
  font-weight: 600;
  color: var(--fp-primary);
  background: color-mix(in srgb, var(--fp-primary) 12%, transparent);
  padding: 2px 8px;
  border-radius: 10px;
}

.onboarding__dismiss {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--fp-text-tertiary);
  transition: background var(--fp-transition);
}

.onboarding__dismiss:hover {
  background: var(--fp-bg-tertiary);
}

.onboarding__progress-track {
  height: 4px;
  background: var(--fp-bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 14px;
}

.onboarding__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--fp-primary), var(--fp-primary-dark));
  border-radius: 2px;
  transition: width 0.4s ease;
}

.onboarding__steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.onboarding__step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 10px;
  transition: background var(--fp-transition);
  width: 100%;
  text-align: left;
}

.onboarding__step:active {
  background: var(--fp-bg-tertiary);
}

.onboarding__step--done .onboarding__step-label {
  text-decoration: line-through;
  color: var(--fp-text-tertiary);
}

.onboarding__step-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--fp-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--fp-transition);
}

.onboarding__step-icon--done {
  background: var(--fp-primary);
  border-color: var(--fp-primary);
}

.onboarding__step-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--fp-text-secondary);
}

.onboarding__step-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--fp-text);
}
</style>
