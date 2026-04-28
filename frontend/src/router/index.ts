import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/polls/new', component: () => import('@/views/PollCreateView.vue') },
    { path: '/polls/:id', component: () => import('@/views/PollView.vue') },
  ],
})

export default router