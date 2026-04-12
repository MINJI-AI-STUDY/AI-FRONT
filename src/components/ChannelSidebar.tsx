import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ChannelSummary {
  channelId: string
  name: string
  description?: string | null
}

interface ChannelSidebarProps {
  channels: ChannelSummary[]
  activeChannelId: string
  basePath: 'teacher' | 'student'
  title?: string
  description?: string
  className?: string
  footer?: ReactNode
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  basePath,
  title = '학교 채널',
  description,
  className = '',
  footer,
}: ChannelSidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  const [isCompactViewport, setIsCompactViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)')

    const handleChange = () => {
      setIsCompactViewport(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setIsDrawerOpen(true)
      }
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <aside
      className={`channel-sidebar-panel ${isCompactViewport ? 'channel-sidebar-panel-overlay' : ''} ${isDrawerOpen ? 'is-open' : 'is-closed'} ${className}`.trim()}
      aria-label="채널 탐색"
    >
      {isCompactViewport && !isDrawerOpen && (
        <button
          type="button"
          className="channel-sidebar-rail-toggle"
          aria-label="채널 목록 열기"
          title="채널 목록 열기"
          onClick={() => setIsDrawerOpen(true)}
        >
          <span className="material-symbols-outlined">left_panel_open</span>
        </button>
      )}

      <button
        type="button"
        className={`channel-sidebar-backdrop ${isCompactViewport && isDrawerOpen ? 'is-visible' : ''}`}
        aria-label="채널 목록 닫기"
        tabIndex={isCompactViewport && isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className={`channel-sidebar-surface ${isDrawerOpen ? 'is-open' : 'is-closed'}`}>
        <div className="channel-sidebar-header">
          <div>
            <div className="workspace-main-eyebrow">채널</div>
            <strong>{title}</strong>
            {description && <p className="channel-sidebar-summary">{description}</p>}
          </div>

          {isCompactViewport && (
            <button
              type="button"
              className="channel-sidebar-toggle"
              aria-label={isDrawerOpen ? '채널 목록 닫기' : '채널 목록 열기'}
              title={isDrawerOpen ? '채널 목록 닫기' : '채널 목록 열기'}
              onClick={() => setIsDrawerOpen((current) => !current)}
            >
              <span className="material-symbols-outlined">{isDrawerOpen ? 'close' : 'menu'}</span>
            </button>
          )}
        </div>

        <nav className="channel-sidebar-list" aria-label="채널 목록">
          {channels.map((channel) => (
            <Link key={channel.channelId} to={`/${basePath}/channels/${channel.channelId}`} className={`channel-sidebar-item ${activeChannelId === channel.channelId ? 'active' : ''}`}>
              <div className="channel-sidebar-name"># {channel.name}</div>
              <div className="channel-sidebar-description">{channel.description || '설명 없음'}</div>
            </Link>
          ))}
        </nav>

        {footer && (
          <div className="channel-sidebar-management" aria-label="채널 관리">
            <div className="channel-sidebar-management-label">관리</div>
            <div className="channel-sidebar-footer">{footer}</div>
          </div>
        )}
      </div>
    </aside>
  )
}
