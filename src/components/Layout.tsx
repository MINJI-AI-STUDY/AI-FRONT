/**
 * 공통 레이아웃 컴포넌트
 * 상단 네비게이션과 플로팅 사이드 셸을 제공합니다.
 * 역할 기반 네비게이션: 인증된 사용자만 역할에 맞는 메뉴를 볼 수 있습니다.
 * 익명 사용자: rail과 footer가 없는 프라이버시 전용 셸
 */

import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { token, user } = useAuth()
  const isAuthenticated = !!token && !!user

  return (
    <div className={`layout-shell ${!isAuthenticated ? 'layout-shell-anonymous' : ''}`}>
      <TopNav />
      {isAuthenticated && <FloatingRail />}
      <main className={`layout-content-shell ${!isAuthenticated ? 'layout-content-shell-anonymous' : ''}`}>
        <main className="content">{children}</main>
      </main>
    </div>
  )
}

function TopNav() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const isAuthenticated = !!token && !!user

  // Get initials from display name or fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return '??'
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand font-headline">Curator</div>
      </div>
      <div className="topbar-actions">
        {isAuthenticated && (
          <button
            className="topbar-avatar"
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="프로필"
            title="프로필"
          >
            {getInitials(user?.displayName)}
          </button>
        )}
      </div>
    </header>
  )
}

function FloatingRail() {
  const location = useLocation()
  const { user, token } = useAuth()
  const isActive = (path: string) => location.pathname.startsWith(path)
  const isAuthenticated = !!token && !!user

  if (!isAuthenticated) return null

  return (
    <nav className="floating-rail glass-panel">
      <div className="floating-rail-brand">
        <span className="material-symbols-outlined">school</span>
      </div>
      <div className="floating-rail-links">
        {user?.role === 'STUDENT' && (
          <RailLink to="/student" icon="home" label="학생 홈" active={isActive('/student')} />
        )}
        {user?.role === 'TEACHER' && (
          <RailLink to="/teacher" icon="auto_stories" label="교사 홈" active={isActive('/teacher')} />
        )}
        {user?.role === 'OPERATOR' && (
          <RailLink to="/operator" icon="insights" label="운영 현황" active={isActive('/operator')} />
        )}
      </div>
      <div className="floating-rail-footer">
        <Link to="/legal/privacy" className="floating-footer-link">
          <span className="material-symbols-outlined">lock</span>
          <span>Privacy</span>
        </Link>
      </div>
    </nav>
  )
}

interface RailLinkProps {
  to: string
  icon: string
  label: string
  active: boolean
}

function RailLink({ to, icon, label, active }: RailLinkProps) {
  return (
    <Link to={to} className={`rail-link ${active ? 'active' : ''}`}>
      <span className="material-symbols-outlined rail-link-icon">{icon}</span>
      <span className="rail-link-label">{label}</span>
    </Link>
  )
}

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
}

export function PageContainer({ children, title, description }: PageContainerProps) {
  return (
    <div className="page-container">
      {title && <h1 className="page-title">{title}</h1>}
      {description && <p className="page-description">{description}</p>}
      {children}
    </div>
  )
}
