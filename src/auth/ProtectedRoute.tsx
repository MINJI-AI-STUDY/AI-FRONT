/**
 * 보호된 라우트 컴포넌트
 * 역할 기반 접근 제어를 위한 라우트 가드입니다.
 */

import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from '../api/auth'
import { roleHomePaths } from './roleHomePaths'

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

  const loadingShell = (
    <div className="workspace-page protected-route-loading-shell" aria-busy="true">
      <div className="workspace-header">
        <div className="workspace-header-content workspace-loading-copy">
          <div className="workspace-loading-chip" style={{ width: '6rem' }} />
          <div className="workspace-loading-line" style={{ width: '16rem', maxWidth: '70%' }} />
          <div className="workspace-loading-line" style={{ width: '24rem', maxWidth: '92%', height: '0.8rem' }} />
        </div>
      </div>
      <div className="workspace-layout protected-route-loading-layout sidebar-collapsed">
        <section className="workspace-main protected-route-loading-stage">
          <div className="workspace-main-header">
            <div className="workspace-main-title workspace-loading-copy">
              <div className="workspace-loading-line" style={{ width: '10rem' }} />
              <div className="workspace-loading-line" style={{ width: '18rem', maxWidth: '82%' }} />
            </div>
          </div>
          <div className="workspace-loading-document">
            <div className="workspace-loading-toolbar">
              <div className="workspace-loading-toolbar-copy">
                <div className="workspace-loading-line" style={{ width: '9rem' }} />
                <div className="workspace-loading-line" style={{ width: '15rem', height: '0.8rem' }} />
              </div>
              <div className="workspace-loading-button" style={{ width: '7rem', height: '2.6rem' }} />
            </div>
            <div className="workspace-loading-frame" />
          </div>
        </section>
      </div>
    </div>
  )

  // 로딩 중이면 로딩 표시
  if (loading) {
    return loadingShell
  }

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 토큰은 있지만 사용자 정보가 아직 복원되지 않았다면 로딩 상태를 유지
  if (!user) {
    return loadingShell
  }

  // 역할이 지정되어 있고, 사용자 역할이 허용되지 않으면 접근 거부
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
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
