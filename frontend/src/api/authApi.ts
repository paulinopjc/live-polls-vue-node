import { apiClient } from './client'
import type { AuthResponse, User } from '@/types/auth'

export const authApi = {
  async signInWithGoogle(idToken: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/google', { id_token: idToken })
    return res.data.data
  },

  async me(): Promise<User> {
    const res = await apiClient.get<{ data: User }>('/auth/me')
    return res.data.data
  },
}
