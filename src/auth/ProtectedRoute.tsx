/**
 * 보호된 라우트 컴포넌트
 * 역할 기반 접근 제어를 위한 라우트 가드입니다.
 */

import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context'
import type { Role } from './context'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: Role[]
}

/**
 * 보호된 라우트 컴포넌트
 * @param children - 보호할 자식 컴포넌트
 * @param roles - 허용된 역할 목록 (선택적)
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>로딩 중...</p>
      </div>
    )
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 역할이 지정되어 있고, 사용자 역할이 허용되지 않으면 접근 거부
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

/**
 * 역할별 홈 경로 매핑
 */
export const roleHomePaths: Record<Role, string> = {
  TEACHER: '/teacher',
  STUDENT: '/student',
  OPERATOR: '/operator',
}

/**
 * 로그인 후 역할별 홈으로 리다이렉트하는 컴포넌트
 */
export function RoleBasedHome() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const homePath = roleHomePaths[user.role]
  return <Navigate to={homePath} replace />
}
