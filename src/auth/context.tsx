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
import { getCurrentUser, type Role } from '../api/auth'

/**
 * 사용자 정보 타입
 * 백엔드 MeResponse와 일치: userId, role, displayName
 */
export interface User {
  userId: string
  role: Role
  displayName: string
}

/**
 * 인증 컨텍스트 값 타입
 */
interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (token: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

// 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextValue | null>(null)

// 세션 스토리지 키
const TOKEN_KEY = 'auth_token'

/**
 * 인증 프로바이더 컴포넌트
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => {
    // 세션 스토리지에서 토큰 복원
    return sessionStorage.getItem(TOKEN_KEY)
  })
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
        console.error('사용자 정보 조회 실패:', err)
        setError('사용자 정보를 가져오는데 실패했습니다.')
        // 토큰이 유효하지 않으면 제거
        sessionStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  /**
   * 로그인 함수
   * 토큰을 저장하고 사용자 정보를 가져옵니다.
   */
  const login = async (newToken: string) => {
    sessionStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  /**
   * 로그아웃 함수
   * 토큰과 사용자 정보를 제거합니다.
   */
  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
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
