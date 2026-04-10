import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, ChannelSidebar, MaterialDocumentViewer } from '../../components'
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

  useEffect(() => {
    if (!token || !channelId) return
    const load = async () => {
      const [channelData, workspaceData] = await Promise.all([
        getTeacherChannels(token),
        getTeacherChannelWorkspace(channelId, token),
      ])
      setChannels(channelData)
      setWorkspace(workspaceData)
      setSelectedMaterialId(workspaceData.materials[0]?.materialId ?? null)
      await enterChannel(channelId, token)
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
    const created = await createChannel({ name: newChannelName.trim(), description: '', sortOrder: channels.length + 1 }, token)
    setChannels((prev) => [...prev, created])
    setNewChannelName('')
  }

  const handleRenameChannel = async () => {
    if (!token || !workspace || !newChannelName.trim()) return
    const updated = await updateChannel(workspace.channel.channelId, { name: newChannelName.trim(), description: workspace.channel.description ?? '', sortOrder: workspace.channel.sortOrder, active: workspace.channel.active }, token)
    setWorkspace((prev) => prev ? { ...prev, channel: updated } : prev)
    setChannels((prev) => prev.map((item) => item.channelId === updated.channelId ? updated : item))
    setNewChannelName('')
  }

  const handleUpload = async () => {
    if (!token || !channelId || !uploadFile || !uploadTitle.trim()) return
    const uploaded = await uploadMaterial(uploadFile, { channelId, title: uploadTitle.trim(), description: uploadDescription }, token)
    setWorkspace((prev) => prev ? { ...prev, materials: [uploaded, ...prev.materials] } : prev)
    setSelectedMaterialId(uploaded.materialId)
    setUploadTitle('')
    setUploadDescription('')
    setUploadFile(null)
  }

  if (!workspace || !token || !channelId) return null

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
          </div>

          <div className="workspace-layout channel-layout">
            <section className="workspace-main">
              <div className="workspace-main-header"><div className="workspace-main-title"><div>{selectedMaterial?.title ?? '채널 PDF 없음'}</div></div></div>
              {selectedMaterial ? <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} /> : <div className="workspace-document-placeholder"><p>이 채널에 연결된 PDF가 없습니다.</p></div>}
            </section>
            <aside className="workspace-side teacher-side">
              <Card className="workspace-card">
                <CardBody>
                  <h3 className="workspace-card-title">채널 관리</h3>
                  <div className="workspace-chat-form compact-chat-form">
                    <input className="number-input" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="새 채널 이름 / 현재 채널 새 이름" />
                    <Button onClick={handleCreateChannel}>생성</Button>
                    <Button variant="outline" onClick={handleRenameChannel}>수정</Button>
                  </div>
                </CardBody>
              </Card>
              <Card className="workspace-card">
                <CardBody>
                  <h3 className="workspace-card-title">채널 PDF 업로드</h3>
                  <div className="workspace-chat-form">
                    <input className="number-input" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="자료 제목" />
                    <textarea className="textarea" rows={2} value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="설명" />
                    <input type="file" accept="application/pdf" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                    <Button onClick={handleUpload}>업로드</Button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
