import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import HomePage from '@/pages/HomePage.vue'
import ChannelsPage from '@/pages/ChannelsPage.vue'
import CreatePostPage from '@/pages/CreatePostPage.vue'
import EditPostPage from '@/pages/EditPostPage.vue'
import SchedulerPage from '@/pages/SchedulerPage.vue'
import AnalyticsPage from '@/pages/AnalyticsPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/channels', name: 'channels', component: ChannelsPage },
    { path: '/posts/create', name: 'post-create', component: CreatePostPage },
    { path: '/posts/:id/edit', name: 'post-edit', component: EditPostPage, props: true },
    { path: '/scheduler', name: 'scheduler', component: SchedulerPage },
    { path: '/analytics', name: 'analytics', component: AnalyticsPage },
  ],
})

router.beforeEach(() => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    auth.initFromTelegram()
  }
})

export default router
