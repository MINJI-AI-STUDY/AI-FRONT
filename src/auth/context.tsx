/**
 * 인증 컨텍스트
 * 사용자 인증 상태를 관리하는 React 컨텍스트입니다.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, logout as logoutApi, refreshToken as refreshAccessToken, type Role } from '../api/auth'
import { ApiError } from '../api/client'

/**
 * 사용자 정보 타입
 * 백엔드 MeResponse와 일치: userId, role, displayName
 */
export interface User {
  userId: string
  schoolId: string
  classroomId: string | null
  role: Role
  displayName: string
}

/**
 * 인증 컨텍스트 값 타입
 */
interface AuthContextValue {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextValue | null>(null)

// 세션 스토리지 키
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(TOKEN_KEY)
  })
  const [refreshToken, setRefreshToken] = useState<string | null>(() => sessionStorage.getItem(REFRESH_TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 현재 사용자 정보 조회
   * 토큰이 있으면 사용자 정보를 가져옵니다.
   */
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      setError(null)

      try {
        const userData = await getCurrentUser(token)
        setUser(userData)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && refreshToken) {
          try {
            const refreshed = await refreshAccessToken(refreshToken)
            sessionStorage.setItem(TOKEN_KEY, refreshed.accessToken)
            sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshed.refreshToken)
            setToken(refreshed.accessToken)
            setRefreshToken(refreshed.refreshToken)
            const retriedUser = await getCurrentUser(refreshed.accessToken)
            setUser(retriedUser)
            return
          } catch (refreshErr) {
            console.error('토큰 재발급 실패:', refreshErr)
          }
        }

        console.error('사용자 정보 조회 실패:', err)
        setError('사용자 정보를 가져오는데 실패했습니다.')
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        setToken(null)
        setRefreshToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token, refreshToken])

  /**
   * 로그인 함수
   * 토큰을 저장하고 사용자 정보를 가져옵니다.
   */
  const login = async (newToken: string, newRefreshToken: string) => {
    sessionStorage.setItem(TOKEN_KEY, newToken)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
    setToken(newToken)
    setRefreshToken(newRefreshToken)
  }

  /**
   * 로그아웃 함수
   * 토큰과 사용자 정보를 제거합니다.
   */
  const logout = async () => {
    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)
    if (storedRefreshToken) {
      try {
        await logoutApi(storedRefreshToken)
      } catch (err) {
        console.error('로그아웃 API 실패:', err)
      }
    }
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  /**
   * 에러 초기화 함수
   */
  const clearError = () => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 인증 컨텍스트 훅
 * 인증 상태에 접근하기 위한 커스텀 훅입니다.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth는 AuthProvider 낵�에서 사용해야 합니다.')
  }
  return context
}

// Role 타입 재낵�
export type { Role }
