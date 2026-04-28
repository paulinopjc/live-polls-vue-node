import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Poll, PollWithTotals, VoteUpdate } from '@/types/poll'

export const usePollStore = defineStore('poll', () => {
  const poll = ref<Poll | null>(null)
  const totals = ref<Record<number, number>>({})
  const totalVotes = ref(0)
  const myVoteOptionId = ref<number | null>(null)
  const connectedCount = ref(0)
  const error = ref<string | null>(null)

  function setFromState(data: PollWithTotals) {
    poll.value = data.poll
    totals.value = data.totals
    totalVotes.value = data.total_votes
  }

  function applyVoteUpdate(update: VoteUpdate) {
    totals.value = update.totals
    totalVotes.value = update.total_votes
  }

  function setConnectedCount(count: number) {
    connectedCount.value = count
  }

  function setMyVote(optionId: number) {
    myVoteOptionId.value = optionId
  }

  function setError(message: string | null) {
    error.value = message
  }

  function reset() {
    poll.value = null
    totals.value = {}
    totalVotes.value = 0
    myVoteOptionId.value = null
    connectedCount.value = 0
    error.value = null
  }

  return {
    poll,
    totals,
    totalVotes,
    myVoteOptionId,
    connectedCount,
    error,
    setFromState,
    applyVoteUpdate,
    setConnectedCount,
    setMyVote,
    setError,
    reset,
  }
})