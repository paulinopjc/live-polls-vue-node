<template>
  <div class="max-w-sm mx-auto py-12">
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900 mb-1">Sign in</h1>
      <p class="text-sm text-gray-500 mb-6">
        Sign in with Google to create polls.
      </p>

      <div v-if="errorMsg" class="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
        {{ errorMsg }}
      </div>

      <div class="flex justify-center">
        <a
          :href="googleAuthUrl"
          class="inline-flex items-center gap-3 px-5 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[44px]"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const apiUrl = import.meta.env.VITE_API_URL

const errorMsg = computed(() => (route.query.error as string) || null)

const googleAuthUrl = computed(() => {
  const redirect = (route.query.redirect as string) || '/'
  return `${apiUrl}/auth/google?redirect=${encodeURIComponent(redirect)}`
})
</script>
