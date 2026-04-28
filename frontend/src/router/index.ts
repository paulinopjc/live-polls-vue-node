import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/polls', component: () => import('@/views/PollListView.vue') },
    { path: '/polls/new', component: () => import('@/views/PollCreateView.vue'), meta: { requiresAuth: true } },
    { path: '/polls/:id', component: () => import('@/views/PollView.vue') },
    { path: '/admin/polls', component: () => import('@/views/AdminPollsView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  ],
})

function readUser(key: string): { role?: string } | null {
  const stored = localStorage.getItem(key)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

router.beforeEach((to) => {
  const token = localStorage.getItem('live-polls-token')
  const user = readUser('live-polls-user')

  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return '/'
  }
  if (to.meta.guestOnly && token) {
    return '/'
  }
})

export default router
