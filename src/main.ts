import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useThemeStore } from './stores/useThemeStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
