import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { PanelMode } from '../hooks/useWorkspaceShell'

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
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  panelMode?: PanelMode
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  basePath,
  title = '학교 채널',
  description,
  className = '',
  footer,
  isOpen,
  onOpenChange,
  panelMode = 'inline',
}: ChannelSidebarProps) {
  const isOverlayPanel = panelMode === 'overlay'
  const [uncontrolledDrawerOpen, setUncontrolledDrawerOpen] = useState(false)
  const isDrawerOpen = isOpen ?? (isOverlayPanel ? uncontrolledDrawerOpen : true)

  const handleToggleDrawer = () => {
    const nextOpen = !isDrawerOpen

    if (onOpenChange) {
      onOpenChange(nextOpen)
      return
    }

    setUncontrolledDrawerOpen(nextOpen)
  }

  return (
    <>
      <aside
        className={`channel-sidebar-panel ${isOverlayPanel ? 'channel-sidebar-panel-overlay' : 'channel-sidebar-panel-inline'} ${isDrawerOpen ? 'is-open' : 'is-closed'} ${className}`.trim()}
        aria-label="채널 탐색"
        data-testid="left-sidebar-panel"
      >
        {isOverlayPanel && isDrawerOpen && <div className="channel-sidebar-backdrop is-visible" aria-hidden="true" />}

        <div className={`channel-sidebar-surface ${isDrawerOpen ? 'is-open' : 'is-closed'}`}>
          <div className="channel-sidebar-header">
            <div>
              <div className="workspace-main-eyebrow">채널</div>
              <strong>{title}</strong>
              {description && <p className="channel-sidebar-summary">{description}</p>}
            </div>
          </div>

          <nav className="channel-sidebar-list" aria-label="채널 목록">
            {channels.map((channel) => (
              <Link
                key={channel.channelId}
                to={`/${basePath}/channels/${channel.channelId}`}
                className={`channel-sidebar-item ${activeChannelId === channel.channelId ? 'active' : ''}`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="channel-sidebar-name"># {channel.name}</div>
                <div className="channel-sidebar-description">{channel.description || '설명 없음'}</div>
              </Link>
            ))}
          </nav>

          {footer && (
            <div className="channel-sidebar-management">
              <div className="channel-sidebar-management-label">관리</div>
              <div className="channel-sidebar-footer">{footer}</div>
            </div>
          )}
        </div>
      </aside>

      {onOpenChange && (
        <button
          type="button"
          className="workspace-tool-button workspace-edge-handle workspace-edge-handle--left workspace-edge-handle--floating"
          onClick={handleToggleDrawer}
          aria-label={isDrawerOpen ? '채널 목록 닫기' : '채널 목록 열기'}
          title={isDrawerOpen ? '채널 목록 닫기' : '채널 목록 열기'}
          data-testid="left-sidebar-handle"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{isDrawerOpen ? 'left_panel_close' : 'left_panel_open'}</span>
        </button>
      )}
    </>
  )
}
