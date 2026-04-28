export type UserRole = 'member' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  google_sub: string | null
  is_active: boolean
  created_at: string
}
