import { createContext } from 'react'
import type { PrivacyConsentResponse, Role } from '../api/auth'

export interface User {
  userId: string
  schoolId: string
  classroomId: string | null
  role: Role
  displayName: string
  studentCode: string | null
  active: boolean
  createdAt: string
  privacyConsents: PrivacyConsentResponse[]
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
