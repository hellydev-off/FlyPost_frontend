<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToastStore } from '@/stores/useToastStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { profileApi, type ProfileData, type ProfileStats } from '@/api/profile.api'
import { useAchievementsStore } from '@/stores/useAchievementsStore'
import { ACHIEVEMENT_META } from '@/types/achievement.types'
import { usePlanStore } from '@/stores/usePlanStore'
import { PLAN_META } from '@/types/plan.types'
import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const themeStore = useThemeStore()
const achievementsStore = useAchievementsStore()
const planStore = usePlanStore()

const profile = ref<ProfileData | null>(null)
const stats = ref<ProfileStats | null>(null)
const loading = ref(true)

// Edit form
const editing = ref(false)
const editFirstName = ref('')
const editUsername = ref('')
const saving = ref(false)

// Password form
const showPasswordModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

const initials = computed(() => {
  if (!profile.value) return '?'
  return profile.value.firstName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const memberSince = computed(() => {
  if (!profile.value) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

onMounted(async () => {
  achievementsStore.fetchAll()
  try {
    const [p, s] = await Promise.all([profileApi.get(), profileApi.getStats()])
    profile.value = p
    stats.value = s
  } catch {
    toast.show('Не удалось загрузить профиль', 'error')
  } finally {
    loading.value = false
  }
})

function startEdit(): void {
  if (!profile.value) return
  editFirstName.value = profile.value.firstName
  editUsername.value = profile.value.username ?? ''
  editing.value = true
}

async function saveEdit(): Promise<void> {
  if (!editFirstName.value.trim()) {
    toast.show('Введите имя', 'error')
    return
  }
  saving.value = true
  try {
    profile.value = await profileApi.update({
      firstName: editFirstName.value.trim(),
      username: editUsername.value.trim(),
    })
    if (auth.user) {
      auth.user.firstName = profile.value.firstName
      auth.user.username = profile.value.username
      localStorage.setItem('fp_user', JSON.stringify(auth.user))
    }
    editing.value = false
    toast.show('Профиль обновлён', 'success')
  } catch {
    toast.show('Не удалось сохранить', 'error')
  } finally {
    saving.value = false
  }
}

async function savePassword(): Promise<void> {
  if (newPassword.value.length < 6) {
    toast.show('Пароль минимум 6 символов', 'error')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.show('Пароли не совпадают', 'error')
    return
  }
  changingPassword.value = true
  try {
    await profileApi.changePassword(currentPassword.value, newPassword.value)
    showPasswordModal.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.show('Пароль изменён', 'success')
  } catch {
    toast.show('Неверный текущий пароль', 'error')
  } finally {
    changingPassword.value = false
  }
}

function doLogout(): void {
  auth.logout()
  router.replace({ name: 'welcome' })
}
</script>

<template>
  <div class="profile">
    <h1 class="profile__title">Профиль</h1>

    <template v-if="loading">
      <AppSkeleton height="160px" class="mt" />
      <AppSkeleton height="80px" class="mt" />
      <AppSkeleton height="120px" class="mt" />
    </template>

    <template v-else-if="profile">
      <!-- Avatar & Name -->
      <div class="profile__card">
        <div class="profile__avatar">{{ initials }}</div>
        <div class="profile__info">
          <h2 class="profile__name">{{ profile.firstName }}</h2>
          <p v-if="profile.email" class="profile__email">{{ profile.email }}</p>
          <p v-if="profile.username" class="profile__username">@{{ profile.username }}</p>
        </div>
      </div>

      <!-- Stats -->
      <div v-if="stats" class="profile__stats stagger">
        <div class="profile__stat">
          <span class="profile__stat-value">{{ stats.channels }}</span>
          <span class="profile__stat-label">Каналов</span>
        </div>
        <div class="profile__stat">
          <span class="profile__stat-value">{{ stats.posts }}</span>
          <span class="profile__stat-label">Постов</span>
        </div>
        <div class="profile__stat">
          <span class="profile__stat-value">{{ stats.published }}</span>
          <span class="profile__stat-label">Опубликовано</span>
        </div>
        <div class="profile__stat">
          <span class="profile__stat-value">{{ stats.scheduled }}</span>
          <span class="profile__stat-label">Запланировано</span>
        </div>
      </div>

      <!-- Theme toggle -->
      <div class="profile__section">
        <h3 class="profile__section-title">Оформление</h3>
        <div class="profile__theme-toggle" @click="themeStore.toggle()">
          <div class="profile__theme-info">
            <AppIcon :name="themeStore.theme === 'dark' ? 'moon' : 'sun'" :size="20" />
            <span>{{ themeStore.theme === 'dark' ? 'Тёмная тема' : 'Светлая тема' }}</span>
          </div>
          <div class="profile__toggle" :class="{ 'profile__toggle--active': themeStore.theme === 'dark' }">
            <span class="profile__toggle-knob" />
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="profile__section">
        <h3 class="profile__section-title">Информация</h3>

        <template v-if="!editing">
          <div class="profile__row">
            <span class="profile__row-label">Имя</span>
            <span class="profile__row-value">{{ profile.firstName }}</span>
          </div>
          <div class="profile__row">
            <span class="profile__row-label">Username</span>
            <span class="profile__row-value">{{ profile.username ?? '—' }}</span>
          </div>
          <div class="profile__row">
            <span class="profile__row-label">Email</span>
            <span class="profile__row-value">{{ profile.email ?? '—' }}</span>
          </div>
          <div v-if="profile.telegramId" class="profile__row">
            <span class="profile__row-label">Telegram ID</span>
            <span class="profile__row-value">{{ profile.telegramId }}</span>
          </div>
          <div class="profile__row">
            <span class="profile__row-label">Дата регистрации</span>
            <span class="profile__row-value">{{ memberSince }}</span>
          </div>

          <AppButton block variant="secondary" class="mt" @click="startEdit">
            <AppIcon name="draft" :size="16" />
            Редактировать
          </AppButton>
        </template>

        <template v-else>
          <div class="profile__edit-form">
            <AppInput v-model="editFirstName" label="Имя" placeholder="Ваше имя" />
            <AppInput v-model="editUsername" label="Username" placeholder="username" />
            <div class="profile__edit-actions">
              <AppButton block :loading="saving" @click="saveEdit">Сохранить</AppButton>
              <AppButton block variant="ghost" @click="editing = false">Отмена</AppButton>
            </div>
          </div>
        </template>
      </div>

      <!-- Achievements -->
      <div class="profile__section">
        <h3 class="profile__section-title">Достижения</h3>
        <div class="profile__achievements">
          <div
            v-for="meta in Object.values(ACHIEVEMENT_META)"
            :key="meta.type"
            class="profile__achievement"
            :class="{ 'profile__achievement--locked': !achievementsStore.hasType(meta.type) }"
          >
            <span class="profile__achievement-emoji">{{ meta.emoji }}</span>
            <div class="profile__achievement-info">
              <span class="profile__achievement-title">{{ meta.title }}</span>
              <span class="profile__achievement-desc">{{ meta.description }}</span>
            </div>
            <span v-if="achievementsStore.hasType(meta.type)" class="profile__achievement-check">✓</span>
          </div>
        </div>
      </div>

      <!-- Plan -->
      <div class="profile__section">
        <h3 class="profile__section-title">Подписка</h3>
        <div
          class="profile__plan-card"
          :style="{ borderColor: PLAN_META[planStore.effectivePlan].color + '40' }"
          @click="router.push({ name: 'pricing' })"
        >
          <div class="profile__plan-left">
            <span class="profile__plan-emoji">{{ PLAN_META[planStore.effectivePlan].emoji }}</span>
            <div>
              <span
                class="profile__plan-name"
                :style="{ color: PLAN_META[planStore.effectivePlan].color }"
              >{{ PLAN_META[planStore.effectivePlan].name }}</span>
              <p v-if="planStore.isTrial" class="profile__plan-trial">
                Пробный период · ещё {{ planStore.trialDaysLeft }} дн.
              </p>
              <p v-else-if="planStore.effectivePlan === 'free'" class="profile__plan-trial">
                Бесплатный тариф
              </p>
              <p v-else class="profile__plan-trial">Подписка активна</p>
            </div>
          </div>
          <span class="profile__plan-arrow">
            <AppIcon name="chevron-right" :size="18" color="var(--fp-text-tertiary)" />
          </span>
        </div>
      </div>

      <!-- Security -->
      <div class="profile__section">
        <h3 class="profile__section-title">Безопасность</h3>
        <AppButton block variant="secondary" @click="showPasswordModal = true">
          <AppIcon name="lock" :size="16" />
          Сменить пароль
        </AppButton>
      </div>

      <!-- Logout -->
      <div class="profile__section">
        <AppButton block variant="danger" @click="doLogout">
          <AppIcon name="logout" :size="16" />
          Выйти из аккаунта
        </AppButton>
      </div>
    </template>

    <!-- Password Modal -->
    <AppModal v-if="showPasswordModal" title="Сменить пароль" @close="showPasswordModal = false">
      <div class="password-form">
        <AppInput
          v-if="profile?.hasPassword"
          v-model="currentPassword"
          label="Текущий пароль"
          type="password"
          placeholder="Введите текущий пароль"
        />
        <AppInput
          v-model="newPassword"
          label="Новый пароль"
          type="password"
          placeholder="Минимум 6 символов"
        />
        <AppInput
          v-model="confirmPassword"
          label="Подтверждение"
          type="password"
          placeholder="Повторите пароль"
        />
        <AppButton
          block
          :loading="changingPassword"
          :disabled="!newPassword || !confirmPassword"
          @click="savePassword"
        >
          Сменить пароль
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.profile__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 20px;
}

/* Card */
.profile__card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
}

.profile__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--fp-primary) 0%, var(--fp-primary-dark) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.profile__info {
  min-width: 0;
}

.profile__name {
  font-size: 20px;
  font-weight: 700;
  color: var(--fp-text);
  margin-bottom: 2px;
}

.profile__email {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.profile__username {
  font-size: 13px;
  color: var(--fp-primary);
  margin-top: 2px;
}

/* Stats */
.profile__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 16px;
}

.profile__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 4px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
}

.profile__stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--fp-primary);
}

.profile__stat-label {
  font-size: 10px;
  color: var(--fp-text-secondary);
  text-align: center;
}

/* Section */
.profile__section {
  margin-top: 24px;
}

.profile__section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fp-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

/* Theme toggle */
.profile__theme-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  cursor: pointer;
  transition: all var(--fp-transition);
}

.profile__theme-toggle:active {
  transform: scale(0.98);
}

.profile__theme-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--fp-text);
}

.profile__toggle {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--fp-bg-tertiary);
  position: relative;
  transition: background var(--fp-transition);
}

.profile__toggle--active {
  background: var(--fp-primary);
}

.profile__toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform var(--fp-transition);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.profile__toggle--active .profile__toggle-knob {
  transform: translateX(20px);
}

/* Rows */
.profile__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid var(--fp-border);
}

.profile__row:last-of-type {
  border-bottom: none;
}

.profile__row-label {
  font-size: 14px;
  color: var(--fp-text-secondary);
}

.profile__row-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--fp-text);
}

/* Edit form */
.profile__edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile__edit-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

/* Password form */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Achievements */
.profile__achievements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile__achievement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  transition: opacity var(--fp-transition);
}

.profile__achievement--locked {
  opacity: 0.45;
}

.profile__achievement-emoji {
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
}

.profile__achievement-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile__achievement-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--fp-text);
}

.profile__achievement-desc {
  font-size: 12px;
  color: var(--fp-text-secondary);
}

.profile__achievement-check {
  font-size: 16px;
  font-weight: 700;
  color: var(--fp-success);
  flex-shrink: 0;
}

/* Plan card */
.profile__plan-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--fp-bg-secondary);
  border-radius: var(--fp-radius);
  border: 1.5px solid var(--fp-border);
  cursor: pointer;
  transition: all var(--fp-transition);
}

.profile__plan-card:active {
  opacity: 0.8;
}

.profile__plan-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile__plan-emoji {
  font-size: 28px;
  line-height: 1;
}

.profile__plan-name {
  font-size: 17px;
  font-weight: 800;
  display: block;
}

.profile__plan-trial {
  font-size: 12px;
  color: var(--fp-text-secondary);
  margin-top: 2px;
}
</style>
