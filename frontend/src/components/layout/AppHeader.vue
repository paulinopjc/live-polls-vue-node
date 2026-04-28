<template>
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <router-link to="/" class="text-xl font-semibold text-gray-900">
        📊 Live Polls
      </router-link>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-3">
        <router-link to="/polls" class="text-sm text-gray-600 hover:text-gray-900">
          All Polls
        </router-link>
        <template v-if="auth.isAuthenticated">
          <router-link
            to="/polls/new"
            class="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            New Poll
          </router-link>
          <router-link
            v-if="auth.isAdmin"
            to="/admin/polls"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Admin
          </router-link>
          <span class="text-sm text-gray-500">{{ auth.user?.name }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            class="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Sign In
          </router-link>
        </template>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        @click="menuOpen = !menuOpen"
        aria-label="Toggle menu"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <nav v-if="menuOpen" class="md:hidden border-t border-gray-200 px-4 py-3 space-y-2">
      <router-link to="/polls" class="block text-sm text-gray-600 py-2 min-h-[44px] flex items-center" @click="menuOpen = false">
        All Polls
      </router-link>
      <template v-if="auth.isAuthenticated">
        <router-link to="/polls/new" class="block text-sm text-indigo-600 py-2 min-h-[44px] flex items-center" @click="menuOpen = false">
          New Poll
        </router-link>
        <router-link
          v-if="auth.isAdmin"
          to="/admin/polls"
          class="block text-sm text-gray-600 py-2 min-h-[44px] flex items-center"
          @click="menuOpen = false"
        >
          Admin
        </router-link>
        <div class="text-sm text-gray-500 py-2">{{ auth.user?.name }}</div>
        <button
          @click="handleLogout(); menuOpen = false"
          class="block text-sm text-red-600 py-2 min-h-[44px]"
        >
          Logout
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="block text-sm text-indigo-600 py-2 min-h-[44px] flex items-center" @click="menuOpen = false">
          Sign In
        </router-link>
      </template>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
