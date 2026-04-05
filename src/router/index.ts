import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes (гостевые)
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/pages/WelcomePage.vue'),
      meta: { guest: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guest: true },
    },

    // App routes (требуют авторизации)
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/channels',
      name: 'channels',
      component: () => import('@/pages/ChannelsPage.vue'),
    },
    {
      path: '/posts/create',
      name: 'post-create',
      component: () => import('@/pages/CreatePostPage.vue'),
    },
    {
      path: '/posts/:id/edit',
      name: 'post-edit',
      component: () => import('@/pages/EditPostPage.vue'),
      props: true,
    },
    {
      path: '/scheduler',
      name: 'scheduler',
      component: () => import('@/pages/SchedulerPage.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/pages/CalendarPage.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/pages/AnalyticsPage.vue'),
    },
    {
      path: '/competitors',
      name: 'competitors',
      component: () => import('@/pages/CompetitorsPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/ProfilePage.vue'),
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/pages/PricingPage.vue'),
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('@/pages/TemplatesPage.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/pages/HistoryPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Восстанавливаем сессию из localStorage при первом заходе
  if (!auth.isAuthenticated) {
    auth.restoreSession()
  }

  const isGuest = to.meta.guest === true

  // Неавторизован и идёт не на гостевую страницу → на welcome
  if (!auth.isAuthenticated && !isGuest) {
    return { name: 'welcome' }
  }

  // Авторизован и идёт на гостевую → на home
  if (auth.isAuthenticated && isGuest) {
    return { name: 'home' }
  }
})

export default router
