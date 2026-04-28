import { z } from 'zod'

export const createPollSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  options: z
    .array(z.string().min(1).max(200))
    .min(2, 'At least 2 options required')
    .max(6, 'At most 6 options allowed')
    .refine(
      (arr) => new Set(arr.map((s) => s.trim())).size === arr.length,
      'Options must be unique'
    ),
})

export const voteSchema = z.object({
  pollId: z.string().min(1),
  optionId: z.number().int().positive(),
  sessionId: z.string().min(8).max(64),
})

export const joinSchema = z.object({
  pollId: z.string().min(1),
})

export type CreatePollSchema = z.infer<typeof createPollSchema>
export type VoteSchema = z.infer<typeof voteSchema>
export type JoinSchema = z.infer<typeof joinSchema>