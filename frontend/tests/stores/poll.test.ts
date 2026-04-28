import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePollStore } from '@/stores/poll'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('poll store', () => {
  it('starts empty', () => {
    const store = usePollStore()
    expect(store.poll).toBeNull()
    expect(store.totals).toEqual({})
    expect(store.totalVotes).toBe(0)
  })

  it('setFromState populates state', () => {
    const store = usePollStore()
    store.setFromState({
      poll: {
        id: 'x',
        question: 'Q?',
        options: [{ id: 1, label: 'A', position: 0 }],
        created_at: '2026-01-01',
      },
      totals: { 1: 5 },
      total_votes: 5,
    })
    expect(store.poll?.id).toBe('x')
    expect(store.totals[1]).toBe(5)
    expect(store.totalVotes).toBe(5)
  })

  it('applyVoteUpdate replaces totals and total_votes', () => {
    const store = usePollStore()
    store.applyVoteUpdate({
      optionId: 1,
      totals: { 1: 6, 2: 4 },
      total_votes: 10,
    })
    expect(store.totals).toEqual({ 1: 6, 2: 4 })
    expect(store.totalVotes).toBe(10)
  })

  it('reset clears all fields', () => {
    const store = usePollStore()
    store.setFromState({
      poll: {
        id: 'x',
        question: 'Q?',
        options: [],
        created_at: '2026-01-01',
      },
      totals: { 1: 5 },
      total_votes: 5,
    })
    store.setMyVote(1)
    store.setError('err')

    store.reset()
    expect(store.poll).toBeNull()
    expect(store.totals).toEqual({})
    expect(store.totalVotes).toBe(0)
    expect(store.myVoteOptionId).toBeNull()
    expect(store.error).toBeNull()
  })
})