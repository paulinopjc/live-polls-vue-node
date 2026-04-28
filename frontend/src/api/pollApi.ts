import { apiClient } from './client'
import type { CreatePollInput, Poll, PollWithTotals } from '@/types/poll'

interface SinglePollResponse {
  data: Poll
}

interface PollWithTotalsResponse {
  data: PollWithTotals
}

export const pollApi = {
  async create(input: CreatePollInput): Promise<Poll> {
    const res = await apiClient.post<SinglePollResponse>('/polls', input)
    return res.data.data
  },

  async find(id: string): Promise<PollWithTotals> {
    const res = await apiClient.get<PollWithTotalsResponse>(`/polls/${id}`)
    return res.data.data
  },
}