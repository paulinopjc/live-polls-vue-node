export type PollStatus = 'pending' | 'approved' | 'denied'

export interface PollOption {
  id: number
  label: string
  position: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  status: PollStatus
  user_id: number | null
  created_at: string
}

export interface CreatePollInput {
  question: string
  options: string[]
}

export interface PollWithTotals {
  poll: Poll
  totals: Record<number, number>
  total_votes: number
}

export interface VoteUpdate {
  optionId: number
  totals: Record<number, number>
  total_votes: number
}
