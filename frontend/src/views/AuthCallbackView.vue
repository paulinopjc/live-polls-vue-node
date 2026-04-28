<template>
  <div class="max-w-sm mx-auto py-12 text-center">
    <p v-if="errorMsg" class="text-red-600 bg-red-50 rounded px-4 py-3 text-sm">{{ errorMsg }}</p>
    <p v-else class="text-gray-500 text-sm">Signing in...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const errorMsg = ref<string | null>(null)

onMounted(() => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const token = params.get('token')
  const userStr = params.get('user')
  const redirect = params.get('redirect') || '/'

  window.history.replaceState(null, '', window.location.pathname)

  if (!token || !userStr) {
    errorMsg.value = 'Sign-in failed. No credentials received.'
    return
  }

  try {
    const user = JSON.parse(decodeURIComponent(userStr))
    auth.handleOAuthCallback({ user, token })
    router.replace(redirect)
  } catch {
    errorMsg.value = 'Sign-in failed. Invalid credentials.'
  }
})
</script>
