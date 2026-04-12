import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, ChannelSidebar, MaterialDocumentViewer, Modal, Input } from '../../components'
import { createChannel, getTeacherChannelWorkspace, getTeacherChannels, sendChannelMessage, updateChannel, uploadMaterial, type ChannelMessageResponse, type ChannelParticipantResponse, type ChannelResponse, type ChannelWorkspaceResponse } from '../../api/teacher'
import { enterChannel, heartbeatChannel, leaveChannel, subscribeChannelEvents } from '../../api/realtime'
import type { ChannelEventResponse } from '../../api/realtime_types'
import '../WorkspacePages.css'

export function TeacherChannelWorkspacePage() {
  const { channelId } = useParams<{ channelId: string }>()
  const { token } = useAuth()
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [workspace, setWorkspace] = useState<ChannelWorkspaceResponse | null>(null)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !channelId) return
    const load = async () => {
      try {
        const [channelData, workspaceData] = await Promise.all([
          getTeacherChannels(token),
          getTeacherChannelWorkspace(channelId, token),
        ])
        setChannels(channelData)
        setWorkspace(workspaceData)
        setSelectedMaterialId(workspaceData.materials[0]?.materialId ?? null)
        await enterChannel(channelId, token)
      } catch (err) {
        console.error('교사 채널 워크스페이스 로드 실패:', err)
        setError('채널 운영 화면을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(() => heartbeatChannel(channelId, token), 15000)
    const eventSource = subscribeChannelEvents(channelId, token, (event: ChannelEventResponse) => {
      setWorkspace((prev) => {
        if (!prev) return prev
        if (event.type === 'presence' || event.type === 'ready') {
          return { ...prev, participants: event.participants ?? prev.participants }
        }
        if (event.type === 'message' && event.message) {
          return { ...prev, recentMessages: [...prev.recentMessages, event.message as ChannelMessageResponse] }
        }
        return prev
      })
    })
    return () => {
      clearInterval(interval)
      eventSource.close()
      leaveChannel(channelId, token).catch(() => undefined)
    }
  }, [channelId, token])

  const selectedMaterial = workspace?.materials.find((item) => item.materialId === selectedMaterialId) ?? workspace?.materials[0] ?? null

  const handleSendMessage = async () => {
    if (!channelId || !token || !message.trim()) return
    await sendChannelMessage(channelId, message.trim(), token)
    setMessage('')
  }

  const handleCreateChannel = async () => {
    if (!token || !newChannelName.trim()) return
    try {
      setCreateError(null)
      const created = await createChannel({ name: newChannelName.trim(), description: '', sortOrder: channels.length + 1 }, token)
      setChannels((prev) => [...prev, created])
      setNewChannelName('')
      setCreateModalOpen(false)
    } catch (err) {
      setCreateError('채널 생성에 실패했습니다.')
    }
  }

  const handleRenameChannel = async () => {
    if (!token || !workspace || !newChannelName.trim()) return
    try {
      const updated = await updateChannel(workspace.channel.channelId, { name: newChannelName.trim(), description: workspace.channel.description ?? '', sortOrder: workspace.channel.sortOrder, active: workspace.channel.active }, token)
      setWorkspace((prev) => prev ? { ...prev, channel: updated } : prev)
      setChannels((prev) => prev.map((item) => item.channelId === updated.channelId ? updated : item))
      setNewChannelName('')
    } catch (err) {
      // Error handling
    }
  }

  const handleUpload = async () => {
    if (!token || !channelId || !uploadFile || !uploadTitle.trim()) return
    try {
      setUploadError(null)
      const uploaded = await uploadMaterial(uploadFile, { channelId, title: uploadTitle.trim(), description: uploadDescription }, token)
      setWorkspace((prev) => prev ? { ...prev, materials: [uploaded, ...prev.materials] } : prev)
      setSelectedMaterialId(uploaded.materialId)
      setUploadTitle('')
      setUploadDescription('')
      setUploadFile(null)
      setUploadModalOpen(false)
    } catch (err) {
      setUploadError('업로드에 실패했습니다.')
    }
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error) return <div className="error-container"><p>{error}</p></div>
  if (!workspace || !token || !channelId) return <div className="error-container"><p>채널 운영 화면을 찾을 수 없습니다.</p></div>

  return (
    <div className="workspace-page teacher-workspace-page channel-workspace-page">
      <div className="channel-shell">
        <ChannelSidebar channels={channels} activeChannelId={channelId} basePath="teacher" />
        <div className="channel-content-shell">
          <div className="workspace-header">
            <div className="workspace-header-content">
              <div className="workspace-section-meta">교사 · 채널 운영</div>
              <h1 className="page-title">{workspace.channel.name}</h1>
              <p className="page-description">현재 입장 학생: {workspace.participants.filter((item: ChannelParticipantResponse) => item.role === 'STUDENT').map((item) => item.displayName).join(', ') || '없음'}</p>
            </div>
            <div className="workspace-actions">
              <button
                type="button"
                className="workspace-tool-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
                title={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
              >
                <span className="material-symbols-outlined">{sidebarOpen ? 'right_panel_close' : 'right_panel_open'}</span>
              </button>
            </div>
          </div>

          <div className={`workspace-layout channel-layout ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <section className="workspace-main">
              <div className="workspace-main-header">
                <div className="workspace-main-title"><div>{selectedMaterial?.title ?? '채널 PDF 없음'}</div></div>
              </div>
              {selectedMaterial ? <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} /> : <div className="workspace-document-placeholder"><p>이 채널에 연결된 PDF가 없습니다.</p></div>}
            </section>
            {sidebarOpen && (
              <aside className="workspace-side teacher-side">
                <Card className="workspace-card">
                  <CardBody>
                    <h3 className="workspace-card-title">채널 관리</h3>
                    <div className="workspace-chat-form compact-chat-form">
                      <input className="number-input" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="현재 채널 새 이름" />
                      <Button variant="outline" onClick={handleRenameChannel}>수정</Button>
                    </div>
                    <div className="workspace-sidebar-actions">
                      <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>add</span>
                        새 채널 생성
                      </Button>
                    </div>
                  </CardBody>
                </Card>
                <Card className="workspace-card">
                  <CardBody>
                    <h3 className="workspace-card-title">채널 PDF 업로드</h3>
                    <div className="workspace-sidebar-actions">
                      <Button onClick={() => setUploadModalOpen(true)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>upload_file</span>
                        PDF 업로드
                      </Button>
                    </div>
                  </CardBody>
                </Card>
                <Card className="workspace-card">
                  <CardBody>
                    <h3 className="workspace-card-title">채널 PDF 목록</h3>
                    <div className="workspace-questions-list">
                      {workspace.materials.map((material) => (
                        <button type="button" key={material.materialId} className={`workspace-option ${selectedMaterial?.materialId === material.materialId ? 'selected' : ''}`} onClick={() => setSelectedMaterialId(material.materialId)}>
                          <span>#{material.docNo}</span>
                          <span>{material.title}</span>
                        </button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
                <Card className="workspace-card workspace-chat-card">
                  <CardBody>
                    <h3 className="workspace-card-title">채널 메시지</h3>
                    <div className="workspace-chat-area">
                      {workspace.recentMessages.map((item) => <div key={item.messageId} className="workspace-chat-bubble assistant"><strong>{item.displayName}</strong> {item.content}</div>)}
                    </div>
                    <div className="workspace-chat-form compact-chat-form">
                      <input className="number-input" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage() } }} placeholder="엔터로 메시지 보내기" />
                      <Button onClick={handleSendMessage}>전송</Button>
                    </div>
                  </CardBody>
                </Card>
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Channel Creation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setCreateError(null); setNewChannelName('') }}
        title="새 채널 생성"
        size="md"
      >
        <div className="modal-form">
          {createError && <div className="modal-error">{createError}</div>}
          <Input
            label="채널 이름"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="새 채널 이름을 입력하세요"
          />
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => { setCreateModalOpen(false); setCreateError(null); setNewChannelName('') }}>취소</Button>
          <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>생성</Button>
        </div>
      </Modal>

      {/* PDF Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setUploadError(null); setUploadTitle(''); setUploadDescription(''); setUploadFile(null) }}
        title="PDF 업로드"
        size="md"
      >
        <div className="modal-form">
          {uploadError && <div className="modal-error">{uploadError}</div>}
          <Input
            label="자료 제목"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="자료 제목을 입력하세요"
          />
          <div className="form-group">
            <label className="input-label">설명</label>
            <textarea className="textarea" rows={3} value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="자료에 대한 설명을 입력하세요" />
          </div>
          <div className="form-group">
            <label className="input-label">PDF 파일</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="file-input"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="file-input-label">
                <span className="material-symbols-outlined">upload_file</span>
                <span>{uploadFile ? uploadFile.name : 'PDF 파일 선택'}</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => { setUploadModalOpen(false); setUploadError(null); setUploadTitle(''); setUploadDescription(''); setUploadFile(null) }}>취소</Button>
          <Button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim()}>업로드</Button>
        </div>
      </Modal>
    </div>
  )
}
