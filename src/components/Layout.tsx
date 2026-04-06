/**
 * 레이아웃 컴포넌트
 * 앱 전체 레이아웃 구조를 정의합니다.
 */

import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

/**
 * 메인 레이아웃 컴포넌트
 * 사이드바와 메인 콘텐츠 영역을 포함합니다.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">{children}</main>
    </div>
  )
}

/**
 * 사이드바 컴포넌트
 * 네비게이션 링크와 서비스 정보를 표시합니다.
 */
function Sidebar() {
  const location = useLocation()
  const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">AI-STUDY MVP</h2>
      <nav className="sidebar-nav">
        <NavLink to="/login" active={isActive('/login')}>로그인</NavLink>
        <NavLink to="/teacher" active={isActive('/teacher')}>교사</NavLink>
        <NavLink to="/student" active={isActive('/student')}>학생</NavLink>
        <NavLink to="/operator" active={isActive('/operator')}>운영자</NavLink>
      </nav>
      <div className="sidebar-info">
        <strong>서비스 포트</strong>
        <span>Frontend: 5173</span>
        <span>API: {API_URL}</span>
      </div>
    </aside>
  )
}

interface NavLinkProps {
  to: string
  active: boolean
  children: ReactNode
}

/**
 * 네비게이션 링크 컴포넌트
 */
function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link to={to} className={`sidebar-link ${active ? 'active' : ''}`}>
      {children}
    </Link>
  )
}

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
}

/**
 * 페이지 컨테이너 컴포넌트
 * 콘텐츠를 감싸는 컨테이너입니다.
 */
export function PageContainer({ children, title, description }: PageContainerProps) {
  return (
    <div className="page-container">
      {title && <h1 className="page-title">{title}</h1>}
      {description && <p className="page-description">{description}</p>}
      {children}
    </div>
  )
}
