export interface PollOption {
  id: number
  label: string
  position: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
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

export interface VoteInput {
  pollId: string
  optionId: number
  sessionId: string
}

export interface VoteUpdate {
  optionId: number
  totals: Record<number, number>
  total_votes: number
}