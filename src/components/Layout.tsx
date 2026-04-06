/**
 * 공통 레이아웃 컴포넌트
 * 상단 네비게이션과 플로팅 사이드 셸을 제공합니다.
 */

import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-shell">
      <TopNav />
      <FloatingRail />
      <main className="layout-content-shell">
        <main className="content">{children}</main>
      </main>
    </div>
  )
}

function TopNav() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand font-headline">The Academic Atelier</div>
        <nav className="topbar-nav">
          <TopNavLink href="#" active>Home</TopNavLink>
          <TopNavLink href="#">Library</TopNavLink>
          <TopNavLink href="#">Assignments</TopNavLink>
          <TopNavLink href="#">Settings</TopNavLink>
        </nav>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="icon-button" type="button" aria-label="help">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="topbar-avatar">JD</div>
      </div>
    </header>
  )
}

interface TopNavLinkProps {
  href: string
  active?: boolean
  children: ReactNode
}

function TopNavLink({ href, active = false, children }: TopNavLinkProps) {
  return (
    <a href={href} className={`topbar-link ${active ? 'active' : ''}`}>
      {children}
    </a>
  )
}

function FloatingRail() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="floating-rail glass-panel">
      <div className="floating-rail-brand">
        <span className="material-symbols-outlined">school</span>
      </div>
      <div className="floating-rail-links">
        <RailLink to="/student" icon="home" label="학생 홈" active={isActive('/student')} />
        <RailLink to="/teacher" icon="auto_stories" label="교사 홈" active={isActive('/teacher')} />
        <RailLink to="/operator" icon="insights" label="운영 현황" active={isActive('/operator')} />
      </div>
      <div className="floating-rail-footer">
        <a href="#" className="floating-footer-link">
          <span className="material-symbols-outlined">help_outline</span>
          <span>Help</span>
        </a>
        <a href="#" className="floating-footer-link">
          <span className="material-symbols-outlined">lock</span>
          <span>Privacy</span>
        </a>
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
