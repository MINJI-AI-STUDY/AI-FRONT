import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer } from '../../components'
import { askQuestion, getStudentChannels, getStudentChannelWorkspace, sendChannelMessage, type ChannelMessageResponse, type ChannelParticipantResponse, type ChannelResponse, type ChannelWorkspaceResponse, type StudentMaterialSummaryResponse } from '../../api/student'
import { enterChannel, heartbeatChannel, leaveChannel, subscribeChannelEvents } from '../../api/realtime'
import type { ChannelEventResponse } from '../../api/realtime_types'
import { classifyAiResponse, AI_RESPONSE_MESSAGES, getUserFacingErrorMessage, type AiResponseState } from '../../api/aiResponse'
import '../WorkspacePages.css'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  aiState?: AiResponseState
  evidenceSnippets?: string[]
}

export function StudentChannelWorkspacePage() {
  const { channelId } = useParams<{ channelId: string }>()
  const { token } = useAuth()
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [workspace, setWorkspace] = useState<ChannelWorkspaceResponse | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<StudentMaterialSummaryResponse | null>(null)
  const [message, setMessage] = useState('')
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [askError, setAskError] = useState<string | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [showPdfViewer, setShowPdfViewer] = useState(false)

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
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question.trim(),
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, userMessage])
      const result = await askQuestion(selectedMaterial.materialId, { question: question.trim() }, token)

      const aiState = classifyAiResponse(result)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        timestamp: new Date(),
        aiState,
        evidenceSnippets: result.evidenceSnippets,
      }

      setChatHistory((prev) => [...prev, assistantMessage])
      setQuestion('')
    } catch (err) {
      console.error('학생 AI 질문 실패:', err)
      setAskError(getUserFacingErrorMessage(err))
    }
  }

  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  const participantNames = useMemo(() => workspace?.participants.map((participant: ChannelParticipantResponse) => participant.displayName).join(', ') ?? '', [workspace])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error) return <div className="error-container"><p>{error}</p></div>
  if (!workspace || !token || !channelId) return <div className="error-container"><p>채널 워크스페이스를 찾을 수 없습니다.</p></div>

  return (
    <div className="workspace-page student-workspace-page channel-workspace-page">
      <div className={`channel-shell student-channel-shell ${!leftSidebarOpen ? 'left-sidebar-collapsed' : ''}`}>
        {leftSidebarOpen && (
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
          </aside>
        )}
        <div className="channel-content-shell">
          <div className="workspace-header">
            <div className="workspace-header-content">
              <div className="workspace-section-meta">학생 · 채널 학습</div>
              <h1 className="page-title">{workspace.channel.name}</h1>
              <p className="page-description">현재 입장 학생: {participantNames || '없음'}</p>
            </div>
            <div className="workspace-actions">
              <button
                type="button"
                className="workspace-tool-button"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                aria-label={leftSidebarOpen ? '채널 목록 닫기' : '채널 목록 열기'}
                title={leftSidebarOpen ? '채널 목록 닫기' : '채널 목록 열기'}
              >
                <span className="material-symbols-outlined">{leftSidebarOpen ? 'left_panel_close' : 'left_panel_open'}</span>
              </button>
              <button
                type="button"
                className="workspace-tool-button"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                aria-label={rightSidebarOpen ? 'AI 도우미 닫기' : 'AI 도우미 열기'}
                title={rightSidebarOpen ? 'AI 도우미 닫기' : 'AI 도우미 열기'}
              >
                <span className="material-symbols-outlined">{rightSidebarOpen ? 'right_panel_close' : 'right_panel_open'}</span>
              </button>
            </div>
          </div>

          <div className={`workspace-layout channel-layout student-three-column ${!rightSidebarOpen ? 'sidebar-collapsed' : ''}`}>
            <section className="workspace-main student-main-chat">
              <div className="workspace-main-header">
                <div className="workspace-main-title">
                  <div>채널 대화</div>
                </div>
              </div>
              <div className="student-chat-container">
                <div className="student-message-list-primary">
                  {workspace.recentMessages.length === 0 ? (
                    <p className="workspace-empty">아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
                  ) : (
                    workspace.recentMessages.map((item) => (
                      <div key={item.messageId} className="student-message-item">
                        <strong>{item.displayName}</strong>
                        <span>{item.content}</span>
                      </div>
                    ))
                  )}
                </div>
                <div className="student-message-input-primary">
                  <input
                    className="number-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage() } }}
                    placeholder="메시지 입력 후 Enter로 전송..."
                  />
                  <Button size="sm" onClick={handleSendMessage}>전송</Button>
                </div>
              </div>
            </section>
            {rightSidebarOpen && (
              <aside className="workspace-side student-side">
                <Card className="workspace-card workspace-ai-card">
                  <CardBody>
                    <h3 className="workspace-card-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem', verticalAlign: 'middle' }}>smart_toy</span>
                      자료 기반 AI 도우미
                    </h3>
                    {askError && <div className="modal-error" style={{ marginBottom: '0.75rem' }}>{askError}</div>}
                    <div className="workspace-ai-material-selector">
                      <label className="input-label">질문할 자료</label>
                      <select
                        className="number-input"
                        value={selectedMaterial?.materialId ?? ''}
                        onChange={(e) => {
                          const material = workspace.materials.find(m => m.materialId === e.target.value)
                          if (material) setSelectedMaterial(material)
                        }}
                      >
                        {workspace.materials.map((material) => (
                          <option key={material.materialId} value={material.materialId}>
                            #{material.docNo} {material.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="workspace-ai-chat-area">
                      {chatHistory.length === 0 ? (
                        <p className="workspace-empty">자료에 대해 궁금한 점을 질문하면 AI가 답변합니다.</p>
                      ) : (
                        chatHistory.map((msg) => (
                          <div key={msg.id} className={`workspace-chat-bubble ${msg.role}`}>
                            {msg.role === 'assistant' && (
                              <div style={{ marginBottom: '0.25rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>smart_toy</span>
                                  AI
                                </div>
                                {msg.aiState && (
                                  <span className={`ai-state-badge ai-state-badge--${msg.aiState}`}>
                                    {AI_RESPONSE_MESSAGES[msg.aiState].badge}
                                  </span>
                                )}
                              </div>
                            )}
                            <div>{msg.content}</div>
                            {msg.role === 'assistant' && msg.aiState && msg.aiState !== 'grounded' && (
                              <div className="ai-state-guidance">
                                {AI_RESPONSE_MESSAGES[msg.aiState].description}
                                {AI_RESPONSE_MESSAGES[msg.aiState].action && ` ${AI_RESPONSE_MESSAGES[msg.aiState].action}`}
                              </div>
                            )}
                            {msg.role === 'assistant' && msg.evidenceSnippets && msg.evidenceSnippets.length > 0 && (
                              <div className="ai-evidence-list">
                                {msg.evidenceSnippets.map((snippet, idx) => (
                                  <div key={idx} className="ai-evidence-item">{snippet}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="workspace-ai-input-area">
                      <textarea
                        className="textarea"
                        rows={3}
                        maxLength={500}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleQuestionKeyDown}
                        placeholder="질문을 입력하세요 (Enter로 전송, Shift+Enter 줄바꿈)"
                      />
                      <Button
                        onClick={handleAsk}
                        disabled={!selectedMaterial || !question.trim()}
                        style={{ marginTop: '0.5rem', width: '100%' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>send</span>
                        질문하기
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                <Card className="workspace-card">
                  <CardBody>
                    <div className="workspace-card-title-with-action">
                      <h3 className="workspace-card-title">채널 자료</h3>
                      <button
                        type="button"
                        className="workspace-text-button"
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                      >
                        {showPdfViewer ? '닫기' : '보기'}
                      </button>
                    </div>
                    <div className="workspace-questions-list">
                      {workspace.materials.map((material) => (
                        <button
                          type="button"
                          key={material.materialId}
                          className={`workspace-option ${selectedMaterial?.materialId === material.materialId ? 'selected' : ''}`}
                          onClick={() => setSelectedMaterial(material)}
                        >
                          <span>#{material.docNo}</span>
                          <span>{material.title}</span>
                        </button>
                      ))}
                    </div>
                    {showPdfViewer && selectedMaterial && (
                      <div className="student-pdf-preview">
                        <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} />
                      </div>
                    )}
                  </CardBody>
                </Card>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
