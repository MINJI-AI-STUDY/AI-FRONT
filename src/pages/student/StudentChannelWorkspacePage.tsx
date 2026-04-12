import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer, Modal } from '../../components'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatbotModalOpen, setChatbotModalOpen] = useState(false)
  const [askError, setAskError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !channelId) return
    const load = async () => {
      try {
        const [channelData, workspaceData] = await Promise.all([
          getStudentChannels(token),
          getStudentChannelWorkspace(channelId, token),
        ])
        setChannels(channelData)
        setWorkspace(workspaceData)
        setSelectedMaterial(workspaceData.materials[0] ?? null)
        await enterChannel(channelId, token)
      } catch (err) {
        console.error('학생 채널 워크스페이스 로드 실패:', err)
        setError('채널 학습 화면을 불러오는데 실패했습니다.')
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

  const handleSendMessage = async () => {
    if (!channelId || !token || !message.trim()) return
    await sendChannelMessage(channelId, message.trim(), token)
    setMessage('')
  }

  const handleAsk = async () => {
    if (!token || !selectedMaterial || !question.trim()) return
    try {
      setAskError(null)
      const result = await askQuestion(selectedMaterial.materialId, { question: question.trim() }, token)
      setQaResponse(result)
      setQuestion('')
    } catch (err) {
      setAskError('질문 처리에 실패했습니다.')
    }
  }

  const participantNames = useMemo(() => workspace?.participants.map((participant: ChannelParticipantResponse) => participant.displayName).join(', ') ?? '', [workspace])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error) return <div className="error-container"><p>{error}</p></div>
  if (!workspace || !token || !channelId) return <div className="error-container"><p>채널 워크스페이스를 찾을 수 없습니다.</p></div>

  return (
    <div className="workspace-page student-workspace-page channel-workspace-page">
      <div className="channel-shell student-channel-shell">
        <aside className="student-left-sidebar">
          <div className="student-sidebar-section">
            <div className="student-sidebar-header">
              <div className="workspace-main-eyebrow">채널 목록</div>
              <strong>학교 채널</strong>
            </div>
            <div className="student-channel-list">
              {channels.map((channel) => (
                <a
                  key={channel.channelId}
                  href={`/student/channels/${channel.channelId}`}
                  className={`student-channel-item ${channelId === channel.channelId ? 'active' : ''}`}
                >
                  <div className="student-channel-name"># {channel.name}</div>
                  <div className="student-channel-description">{channel.description || '설명 없음'}</div>
                </a>
              ))}
            </div>
          </div>
          <div className="student-sidebar-section">
            <div className="student-sidebar-header">
              <div className="workspace-main-eyebrow">채널 메시지</div>
            </div>
            <div className="student-message-list">
              {workspace.recentMessages.slice(-10).map((item) => (
                <div key={item.messageId} className="student-message-item">
                  <strong>{item.displayName}</strong>
                  <span>{item.content}</span>
                </div>
              ))}
            </div>
            <div className="student-message-input">
              <input
                className="number-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage() } }}
                placeholder="메시지 입력..."
              />
              <Button size="sm" onClick={handleSendMessage}>전송</Button>
            </div>
          </div>
        </aside>
        <div className="channel-content-shell">
          <div className="workspace-header">
            <div className="workspace-header-content">
              <div className="workspace-section-meta">학생 · 채널 학습</div>
              <h1 className="page-title">{workspace.channel.name}</h1>
              <p className="page-description">현재 입장 학생: {participantNames || '없음'}</p>
            </div>
            <div className="workspace-actions">
              <Button variant="outline" onClick={() => setChatbotModalOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>chat</span>
                AI 챗봇
              </Button>
            </div>
          </div>

          <div className="workspace-layout channel-layout">
            <section className="workspace-main">
              <div className="workspace-main-header">
                <div className="workspace-main-title">
                  <div>{selectedMaterial?.title ?? '채널 PDF 없음'}</div>
                </div>
              </div>
              {selectedMaterial ? <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} /> : <div className="workspace-document-placeholder"><p>이 채널에 연결된 PDF가 없습니다.</p></div>}
            </section>
            <aside className="workspace-side student-side">
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
            </aside>
          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      <Modal
        isOpen={chatbotModalOpen}
        onClose={() => { setChatbotModalOpen(false); setAskError(null); setQuestion('') }}
        title="AI 챗봇 - 문서 질문"
        size="md"
      >
        <div className="modal-form">
          {askError && <div className="modal-error">{askError}</div>}
          <div className="chatbot-material-info">
            <span className="material-symbols-outlined">description</span>
            <span>{selectedMaterial?.title || 'PDF를 선택하세요'}</span>
          </div>
          {qaResponse && qaResponse.insufficientEvidence ? (
            <div className="no-evidence" style={{ marginBottom: '0.75rem' }}>
              <p>이 답변은 자료에서 직접적인 근거를 찾지 못한 상태입니다. 질문을 더 구체적으로 입력하거나 자료를 다시 확인해주세요.</p>
            </div>
          ) : null}
          {qaResponse && !qaResponse.grounded && !qaResponse.insufficientEvidence ? (
            <div className="modal-error">AI 서버 연결 또는 처리에 실패했습니다. 잠시 후 다시 시도해주세요.</div>
          ) : null}
          <div className="workspace-chat-area modal-chat-area">
            {qaResponse ? (
              <>
                <div className="workspace-chat-bubble user">{question || '최근 질문'}</div>
                <div className="workspace-chat-bubble assistant">{qaResponse.answer}</div>
              </>
            ) : (
              <p className="workspace-empty">문서에 대해 질문을 입력하세요.</p>
            )}
          </div>
          <div className="form-group">
            <label className="input-label">질문</label>
            <textarea
              className="textarea"
              rows={3}
              maxLength={500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요 (Enter로 전송, Shift+Enter 줄바꿈)"
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => { setChatbotModalOpen(false); setAskError(null); setQuestion('') }}>닫기</Button>
          <Button onClick={handleAsk} disabled={!selectedMaterial || !question.trim()}>질문하기</Button>
        </div>
      </Modal>
    </div>
  )
}
