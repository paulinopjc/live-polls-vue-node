import { pool } from '../db/connection'
import type { User, UserRole } from '../types/user'

interface UserRow {
  id: number
  name: string
  email: string
  role: UserRole
  google_sub: string | null
  is_active: boolean
  created_at: string
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    google_sub: row.google_sub,
    is_active: row.is_active,
    created_at: row.created_at,
  }
}

export const userService = {
  async find(id: number): Promise<User | undefined> {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return rows[0] ? rowToUser(rows[0] as UserRow) : undefined
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    return rows[0] ? rowToUser(rows[0] as UserRow) : undefined
  },

  async findOrCreate(input: { name: string; email: string; sub: string }): Promise<User> {
    const existing = await this.findByEmail(input.email)
    if (existing) {
      if (!existing.google_sub) {
        await this.recordGoogleSub(existing.id, input.sub)
      }
      return existing
    }

    const { rows } = await pool.query(
      'INSERT INTO users (name, email, google_sub) VALUES ($1, $2, $3) RETURNING *',
      [input.name, input.email.toLowerCase(), input.sub]
    )
    return rowToUser(rows[0] as UserRow)
  },

  async recordGoogleSub(id: number, sub: string): Promise<void> {
    await pool.query('UPDATE users SET google_sub = $1 WHERE id = $2', [sub, id])
  },
}
