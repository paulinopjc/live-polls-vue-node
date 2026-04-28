import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import './style.css'
import App from './App.vue'
import { useSessionStore } from '@/stores/session'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
app.use(createPinia())

const session = useSessionStore()
session.load()

const auth = useAuthStore()
auth.loadFromStorage()

app.use(router)
app.mount('#app')
