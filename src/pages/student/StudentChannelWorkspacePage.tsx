import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, ChannelSidebar, MaterialDocumentViewer } from '../../components'
import { askQuestion, getStudentChannels, getStudentChannelWorkspace, sendChannelMessage, type ChannelMessageResponse, type ChannelParticipantResponse, type ChannelResponse, type ChannelWorkspaceResponse, type QaResponse, type StudentMaterialSummaryResponse } from '../../api/student'
import { enterChannel, heartbeatChannel, leaveChannel, subscribeChannelEvents } from '../../api/realtime'
import type { ChannelEventResponse } from '../../api/realtime_types'
import '../WorkspacePages.css'

export function StudentChannelWorkspacePage() {
  const { channelId } = useParams<{ channelId: string }>()
  const { token } = useAuth()
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [workspace, setWorkspace] = useState<ChannelWorkspaceResponse | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<StudentMaterialSummaryResponse | null>(null)
  const [message, setMessage] = useState('')
  const [question, setQuestion] = useState('')
  const [qaResponse, setQaResponse] = useState<QaResponse | null>(null)

  useEffect(() => {
    if (!token || !channelId) return
    const load = async () => {
      const [channelData, workspaceData] = await Promise.all([
        getStudentChannels(token),
        getStudentChannelWorkspace(channelId, token),
      ])
      setChannels(channelData)
      setWorkspace(workspaceData)
      setSelectedMaterial(workspaceData.materials[0] ?? null)
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

  const handleSendMessage = async () => {
    if (!channelId || !token || !message.trim()) return
    await sendChannelMessage(channelId, message.trim(), token)
    setMessage('')
  }

  const handleAsk = async () => {
    if (!token || !selectedMaterial || !question.trim()) return
    const result = await askQuestion(selectedMaterial.materialId, { question: question.trim() }, token)
    setQaResponse(result)
    setQuestion('')
  }

  const participantNames = useMemo(() => workspace?.participants.map((participant: ChannelParticipantResponse) => participant.displayName).join(', ') ?? '', [workspace])

  if (!workspace || !token || !channelId) return null

  return (
    <div className="workspace-page student-workspace-page channel-workspace-page">
      <div className="channel-shell">
        <ChannelSidebar channels={channels} activeChannelId={channelId} basePath="student" />
        <div className="channel-content-shell">
          <div className="workspace-header">
            <div className="workspace-header-content">
              <div className="workspace-section-meta">학생 · 채널 학습</div>
              <h1 className="page-title">{workspace.channel.name}</h1>
              <p className="page-description">현재 입장 학생: {participantNames || '없음'}</p>
            </div>
          </div>

          <div className="workspace-layout channel-layout">
            <section className="workspace-main">
              <div className="workspace-main-header">
                <div className="workspace-main-title"><div>{selectedMaterial?.title ?? '채널 PDF 없음'}</div></div>
              </div>
              {selectedMaterial ? <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} /> : <div className="workspace-document-placeholder"><p>이 채널에 연결된 PDF가 없습니다.</p></div>}
            </section>
            <aside className="workspace-side teacher-side">
              <Card className="workspace-card">
                <CardBody>
                  <h3 className="workspace-card-title">채널 PDF</h3>
                  <div className="workspace-questions-list">
                    {workspace.materials.map((material) => (
                      <button type="button" key={material.materialId} className={`workspace-option ${selectedMaterial?.materialId === material.materialId ? 'selected' : ''}`} onClick={() => setSelectedMaterial(material)}>
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
              <Card className="workspace-card workspace-chat-card">
                <CardBody>
                  <h3 className="workspace-card-title">서브 챗봇</h3>
                  <div className="workspace-chat-area">
                    {qaResponse ? <><div className="workspace-chat-bubble user">{question || '최근 질문'}</div><div className="workspace-chat-bubble assistant">{qaResponse.answer}</div></> : <p className="workspace-empty">문서 질문을 입력하세요.</p>}
                  </div>
                  <div className="workspace-chat-form">
                    <textarea className="textarea" rows={3} maxLength={500} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }} placeholder="엔터로 질문 전송 (Shift+Enter 줄바꿈)" />
                    <div className="workspace-chat-actions">
                      <input type="file" accept="image/*" />
                      <Button onClick={handleAsk}>질문하기</Button>
                    </div>
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
