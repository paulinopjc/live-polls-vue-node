import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import './style.css'
import App from './App.vue'
import { useSessionStore } from '@/stores/session'

const app = createApp(App)
app.use(createPinia())

const session = useSessionStore()
session.load()

app.use(router)
app.mount('#app')