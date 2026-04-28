export interface User {
  id: number
  name: string
  email: string
  role: 'member' | 'admin'
}

export interface AuthResponse {
  user: User
  token: string
}
