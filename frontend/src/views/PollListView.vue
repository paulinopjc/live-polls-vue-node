<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">All Polls</h1>
      <router-link
        to="/polls/new"
        class="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        New Poll
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-500">Loading polls...</div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
      Failed to load polls.
    </div>

    <div v-else-if="polls.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg mb-2">No polls yet</p>
      <p class="text-sm mb-4">Create your first poll to get started.</p>
      <router-link
        to="/polls/new"
        class="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
      >
        Create a Poll
      </router-link>
    </div>

    <div v-else class="space-y-3">
      <router-link
        v-for="poll in polls"
        :key="poll.poll.id"
        :to="`/polls/${poll.poll.id}`"
        class="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ poll.poll.question }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{{ poll.poll.options.length }} options</span>
              <span>{{ poll.total_votes }} {{ poll.total_votes === 1 ? 'vote' : 'votes' }}</span>
              <span>{{ formatDate(poll.poll.created_at) }}</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pollApi } from '@/api/pollApi'
import type { PollWithTotals } from '@/types/poll'

const polls = ref<PollWithTotals[]>([])
const loading = ref(true)
const error = ref(false)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(async () => {
  try {
    polls.value = await pollApi.list()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
