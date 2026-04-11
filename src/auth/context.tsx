/**
 * 인증 컨텍스트
 * 사용자 인증 상태를 관리하는 React 컨텍스트입니다.
 */

import {
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, logout as logoutApi, refreshToken as refreshAccessToken } from '../api/auth'
import { ApiError } from '../api/client'
import { AuthContext, type User } from './AuthContext'

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
  const fetchUser = async (accessToken = token) => {
    if (!accessToken) {
      setUser(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userData = await getCurrentUser(accessToken)
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
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
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
        refreshUser: async () => {
          await fetchUser()
        },
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

