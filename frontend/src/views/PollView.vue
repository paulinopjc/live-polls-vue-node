<template>
  <div>
    <div v-if="loading" class="text-center py-12 text-gray-500">Loading…</div>

    <div v-else-if="store.error" class="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
      {{ store.error }}
    </div>

    <div v-else-if="store.poll">
      <ShareLink :url="shareUrl" class="mb-6" />

      <div class="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div class="flex items-start justify-between mb-4">
          <h1 class="text-xl font-semibold text-gray-900">{{ store.poll.question }}</h1>
          <ConnectedCount :count="store.connectedCount" />
        </div>

        <div class="space-y-2">
          <PollOption
            v-for="option in store.poll.options"
            :key="option.id"
            :option="option"
            :count="store.totals[option.id] || 0"
            :total-votes="store.totalVotes"
            :has-voted="store.myVoteOptionId !== null"
            :is-my-vote="store.myVoteOptionId === option.id"
            @vote="onVote"
          />
        </div>

        <p class="text-xs text-gray-500 mt-4 text-right">
          {{ store.totalVotes }} total {{ store.totalVotes === 1 ? 'vote' : 'votes' }}
        </p>
      </div>

      <div class="text-center">
        <router-link to="/polls/new" class="text-sm text-indigo-600 hover:underline">
          + Create another poll
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { pollApi } from '@/api/pollApi'
import { getSocket } from '@/api/socket'
import { useSocket } from '@/composables/useSocket'
import { usePollStore } from '@/stores/poll'
import { useSessionStore } from '@/stores/session'
import PollOption from '@/components/polls/PollOption.vue'
import ConnectedCount from '@/components/polls/ConnectedCount.vue'
import ShareLink from '@/components/polls/ShareLink.vue'
import type { VoteUpdate } from '@/types/poll'

const route = useRoute()
const store = usePollStore()
const session = useSessionStore()

const pollId = String(route.params.id)
const loading = ref(true)
const shareUrl = computed(() => `${window.location.origin}/polls/${pollId}`)

useSocket<{ poll: import('@/types/poll').Poll; totals: Record<number, number>; total_votes: number }>(
  'poll-state',
  (data) => {
    store.setFromState(data)
    loading.value = false
  }
)

useSocket<VoteUpdate>('vote-update', (data) => {
  store.applyVoteUpdate(data)
})

useSocket<{ count: number }>('connection-count', (data) => {
  store.setConnectedCount(data.count)
})

useSocket<{ message: string }>('vote-error', (data) => {
  store.setError(data.message)
})

onMounted(async () => {
  store.reset()
  try {
    const initial = await pollApi.find(pollId)
    store.setFromState(initial)
    loading.value = false
  } catch (e: unknown) {
    const err = e as { response?: { status?: number } }
    if (err.response?.status === 404) {
      store.setError('Poll not found')
    } else {
      store.setError('Failed to load poll')
    }
    loading.value = false
    return
  }

  const socket = getSocket()
  socket.emit('join', { pollId })
})

onBeforeUnmount(() => {
  const socket = getSocket()
  socket.emit('leave', { pollId })
})

function onVote(optionId: number) {
  store.setError(null)
  store.setMyVote(optionId)
  const socket = getSocket()
  socket.emit('vote', {
    pollId,
    optionId,
    sessionId: session.sessionId,
  })
}
</script>