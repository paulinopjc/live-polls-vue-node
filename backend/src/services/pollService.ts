import { pool } from '../db/connection'
import { generatePollId } from '../lib/ids'
import type {
  CreatePollInput,
  Poll,
  PollOption,
  PollStatus,
  PollWithTotals,
  VoteInput,
} from '../types/poll'

interface PollRow {
  id: string
  question: string
  status: PollStatus
  user_id: number | null
  created_at: string
}

interface OptionRow {
  id: number
  poll_id: string
  label: string
  position: number
}

export const pollService = {
  // Public listing: approved polls only
  async list(): Promise<PollWithTotals[]> {
    const { rows: pollRows } = await pool.query(
      "SELECT * FROM polls WHERE status = 'approved' ORDER BY created_at DESC"
    )
    return this.buildPollList(pollRows as PollRow[])
  },

  // Admin listing: all polls regardless of status
  async listAll(): Promise<PollWithTotals[]> {
    const { rows: pollRows } = await pool.query(
      'SELECT * FROM polls ORDER BY created_at DESC'
    )
    return this.buildPollList(pollRows as PollRow[])
  },

  async buildPollList(pollRows: PollRow[]): Promise<PollWithTotals[]> {
    const results: PollWithTotals[] = []
    for (const row of pollRows) {
      const poll = await this.find(row.id)
      if (poll) {
        const totals = await this.getTotals(row.id, poll.options)
        const total_votes = Object.values(totals).reduce((a, b) => a + b, 0)
        results.push({ poll, totals, total_votes })
      }
    }
    return results
  },

  async create(input: CreatePollInput, userId?: number): Promise<Poll> {
    const id = generatePollId()
    const status: PollStatus = userId ? 'pending' : 'approved'
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      await client.query(
        'INSERT INTO polls (id, question, user_id, status) VALUES ($1, $2, $3, $4)',
        [id, input.question, userId ?? null, status]
      )

      for (let position = 0; position < input.options.length; position++) {
        await client.query(
          'INSERT INTO poll_options (poll_id, label, position) VALUES ($1, $2, $3)',
          [id, input.options[position], position]
        )
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    const poll = await this.find(id)
    return poll!
  },

  async find(id: string): Promise<Poll | undefined> {
    const { rows: pollRows } = await pool.query('SELECT * FROM polls WHERE id = $1', [id])
    if (pollRows.length === 0) return undefined
    const pollRow = pollRows[0] as PollRow

    const { rows: optionRows } = await pool.query(
      'SELECT id, poll_id, label, position FROM poll_options WHERE poll_id = $1 ORDER BY position',
      [id]
    )

    const options: PollOption[] = (optionRows as OptionRow[]).map((r) => ({
      id: r.id,
      label: r.label,
      position: r.position,
    }))

    return {
      id: pollRow.id,
      question: pollRow.question,
      options,
      status: pollRow.status,
      user_id: pollRow.user_id,
      created_at: pollRow.created_at,
    }
  },

  async findWithTotals(id: string): Promise<PollWithTotals | undefined> {
    const poll = await this.find(id)
    if (!poll) return undefined

    const totals = await this.getTotals(id, poll.options)
    const total_votes = Object.values(totals).reduce((a, b) => a + b, 0)

    return { poll, totals, total_votes }
  },

  async getTotals(pollId: string, options: PollOption[]): Promise<Record<number, number>> {
    const { rows } = await pool.query(
      'SELECT option_id, COUNT(*)::int as c FROM votes WHERE poll_id = $1 GROUP BY option_id',
      [pollId]
    )

    const totals: Record<number, number> = {}
    for (const opt of options) {
      totals[opt.id] = 0
    }
    for (const row of rows as { option_id: number; c: number }[]) {
      totals[row.option_id] = row.c
    }
    return totals
  },

  async setStatus(id: string, status: PollStatus): Promise<PollWithTotals | undefined> {
    const result = await pool.query(
      'UPDATE polls SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    if (result.rowCount === 0) return undefined
    return this.findWithTotals(id)
  },

  async updateQuestion(id: string, question: string): Promise<PollWithTotals | undefined> {
    const result = await pool.query(
      'UPDATE polls SET question = $1 WHERE id = $2 RETURNING *',
      [question, id]
    )
    if (result.rowCount === 0) return undefined
    return this.findWithTotals(id)
  },

  async deletePoll(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM polls WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },

  async recordVote(input: VoteInput): Promise<{ ok: true; totals: Record<number, number>; total_votes: number } | { ok: false; reason: string }> {
    const poll = await this.find(input.pollId)
    if (!poll) return { ok: false, reason: 'Poll not found' }
    if (poll.status !== 'approved') return { ok: false, reason: 'Poll is not accepting votes' }

    const validOption = poll.options.find((o) => o.id === input.optionId)
    if (!validOption) return { ok: false, reason: 'Invalid option' }

    try {
      await pool.query(
        'INSERT INTO votes (poll_id, option_id, session_id) VALUES ($1, $2, $3)',
        [input.pollId, input.optionId, input.sessionId]
      )
    } catch (e: unknown) {
      const err = e as { code?: string }
      if (err.code === '23505') {
        return { ok: false, reason: 'You have already voted on this poll' }
      }
      throw e
    }

    const totals = await this.getTotals(input.pollId, poll.options)
    const total_votes = Object.values(totals).reduce((a, b) => a + b, 0)

    return { ok: true, totals, total_votes }
  },
}
