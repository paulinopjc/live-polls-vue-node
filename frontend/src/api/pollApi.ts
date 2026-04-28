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

  // Admin methods
  async listAll(): Promise<PollWithTotals[]> {
    const res = await apiClient.get<PollListResponse>('/admin/polls')
    return res.data.data
  },

  async approve(id: string): Promise<PollWithTotals> {
    const res = await apiClient.patch<PollWithTotalsResponse>(`/admin/polls/${id}/approve`)
    return res.data.data
  },

  async deny(id: string): Promise<PollWithTotals> {
    const res = await apiClient.patch<PollWithTotalsResponse>(`/admin/polls/${id}/deny`)
    return res.data.data
  },

  async editQuestion(id: string, question: string): Promise<PollWithTotals> {
    const res = await apiClient.patch<PollWithTotalsResponse>(`/admin/polls/${id}`, { question })
    return res.data.data
  },

  async deletePoll(id: string): Promise<void> {
    await apiClient.delete(`/admin/polls/${id}`)
  },
}
