import { createContext } from 'react'
import type { Role } from '../api/auth'

export interface User {
  userId: string
  schoolId: string
  classroomId: string | null
  role: Role
  displayName: string
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
