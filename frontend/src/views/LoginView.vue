<template>
  <div class="max-w-sm mx-auto py-12">
    <div class="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900 mb-1">Sign in</h1>
      <p class="text-sm text-gray-500 mb-6">
        Sign in with Google to create polls.
      </p>

      <div v-if="auth.error" class="mb-4 text-sm text-red-600 bg-red-50 rounded px-3 py-2">
        {{ auth.error }}
      </div>

      <div v-if="auth.loading" class="mb-4 text-sm text-gray-500">Signing in...</div>

      <div class="flex justify-center">
        <GoogleSignInButton @success="onSuccess" @error="onError" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from 'vue3-google-signin'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function onSuccess(response: CredentialResponse) {
  if (!response.credential) {
    auth.error = 'Google did not return a credential.'
    return
  }
  const ok = await auth.signInWithGoogle(response.credential)
  if (ok) {
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  }
}

function onError() {
  auth.error = 'Google sign-in was cancelled or failed.'
}
</script>
