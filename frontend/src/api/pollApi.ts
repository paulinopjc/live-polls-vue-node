import { apiClient } from './client'
import type { CreatePollInput, Poll, PollWithTotals } from '@/types/poll'

interface SinglePollResponse {
  data: Poll
}

interface PollWithTotalsResponse {
  data: PollWithTotals
}

interface PollListResponse {
  data: PollWithTotals[]
  count: number
}

export const pollApi = {
  async list(): Promise<PollWithTotals[]> {
    const res = await apiClient.get<PollListResponse>('/polls')
    return res.data.data
  },

  async create(input: CreatePollInput): Promise<Poll> {
    const res = await apiClient.post<SinglePollResponse>('/polls', input)
    return res.data.data
  },

  async find(id: string): Promise<PollWithTotals> {
    const res = await apiClient.get<PollWithTotalsResponse>(`/polls/${id}`)
    return res.data.data
  },
}