import type { ReactNode } from 'react'
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
  return (
    <aside className={`channel-sidebar-panel ${className}`.trim()} aria-label="채널 탐색">
      <div className="channel-sidebar-header">
        <div>
          <div className="workspace-main-eyebrow">채널</div>
          <strong>{title}</strong>
          {description && <p className="channel-sidebar-summary">{description}</p>}
        </div>
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
    </aside>
  )
}
