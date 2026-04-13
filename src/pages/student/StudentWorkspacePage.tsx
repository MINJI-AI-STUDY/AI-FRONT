/**
 * 학생 공통 자료 워크스페이스
 * 같은 PDF를 중심으로 문제 풀이와 채팅형 QA를 함께 봅니다.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer, Modal } from '../../components'
import { useWorkspaceShell } from '../../hooks/useWorkspaceShell'
import { askQuestion, getQuestionSet, submitAnswers } from '../../api/student'
import type { StudentQuestionSetResponse } from '../../api/student'
import '../WorkspacePages.css'

interface AnswerState {
  [questionId: string]: number
}

interface QaChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  evidenceSnippets?: string[]
}

interface StudentAiFollowUpContext {
  questionNumber: number
  explanation: string
  selectedOptionLabel: string
  conceptTags: string[]
  prompt: string
}

function consumeStudentAiFollowUpContext() {
  const rawContext = sessionStorage.getItem('student_ai_followup_context')
  if (!rawContext) return null

  try {
    return JSON.parse(rawContext) as StudentAiFollowUpContext
  } catch (err) {
    console.error('오답 AI 해설 문맥을 불러오지 못했습니다:', err)
    return null
  } finally {
    sessionStorage.removeItem('student_ai_followup_context')
  }
}

export function StudentWorkspacePage() {
  const { distributionCode } = useParams<{ distributionCode: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [questionSet, setQuestionSet] = useState<StudentQuestionSetResponse | null>(null)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [question, setQuestion] = useState('')
  const [qaMessages, setQaMessages] = useState<QaChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)
  const [followUpContext, setFollowUpContext] = useState<StudentAiFollowUpContext | null>(null)
  const { rightPanelOpen: rightSidebarOpen, rightPanelMode, toggleRightPanel, setRightPanelOpen } = useWorkspaceShell({
    stateScopeKey: `student-workspace-${distributionCode ?? 'unknown'}`,
  })

  const rightPanelHandle = (
    <button
      type="button"
      className="workspace-tool-button workspace-edge-handle workspace-edge-handle--right workspace-edge-handle--floating"
      onClick={() => toggleRightPanel(!rightSidebarOpen)}
      aria-label={rightSidebarOpen ? '학습 도구 닫기' : '학습 도구 열기'}
      title={rightSidebarOpen ? '학습 도구 닫기' : '학습 도구 열기'}
      data-testid="right-panel-toggle"
    >
      <span className="material-symbols-outlined">{rightSidebarOpen ? 'right_panel_close' : 'right_panel_open'}</span>
    </button>
  )

  useEffect(() => {
    const context = consumeStudentAiFollowUpContext()
    if (!context) return

    setFollowUpContext(context)
    setQuestion(context.prompt)
    setRightPanelOpen(true)
  }, [setRightPanelOpen])

  useEffect(() => {
    if (!distributionCode || !token) return

    const fetchQuestionSet = async () => {
      try {
        const data = await getQuestionSet(distributionCode, token)
        setQuestionSet(data)
      } catch (err) {
        console.error('문제 세트 조회 실패:', err)
        setError('문제 세트를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionSet()
  }, [distributionCode, token])

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }))
  }

  const handleSubmit = async () => {
    if (!distributionCode || !token || !questionSet) return
    const unansweredQuestion = questionSet.questions.find((q) => answers[q.id] === undefined)
    if (unansweredQuestion) {
      setError('모든 문제에 답을 선택해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await submitAnswers(distributionCode, { answers: questionSet.questions.map((q) => ({ questionId: q.id, selectedOptionIndex: answers[q.id] })) }, token)
      sessionStorage.setItem('latest_submission_id', result.submissionId)
      sessionStorage.setItem('latest_material_id', questionSet.materialId)
      sessionStorage.setItem('latest_distribution_code', distributionCode)
      navigate(`/student/submissions/${result.submissionId}`)
    } catch (err) {
      console.error('답안 제출 실패:', err)
      setError('답안 제출에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAsk = async () => {
    if (!questionSet || !token) return
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      setError('질문을 입력해주세요.')
      return
    }
    setAsking(true)
    setError(null)
    try {
      setQaMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: trimmedQuestion,
        },
      ])
      const result = await askQuestion(questionSet.materialId, { question: trimmedQuestion }, token)
      setQaMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          evidenceSnippets: result.evidenceSnippets,
        },
      ])
      setQuestion('')
      setFollowUpContext(null)
    } catch (err) {
      console.error('질의응답 실패:', err)
      setError('질의응답에 실패했습니다.')
    } finally {
      setAsking(false)
    }
  }

  const handleQuestionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  if (loading) {
    return (
      <>
        <div className="workspace-page student-workspace-page" aria-busy="true">
          <div className="workspace-header">
            <div className="workspace-header-content workspace-loading-copy">
              <div className="workspace-loading-chip" style={{ width: '6rem' }} />
              <div className="workspace-loading-line" style={{ width: '18rem', maxWidth: '72%' }} />
              <div className="workspace-loading-line" style={{ width: '24rem', maxWidth: '92%', height: '0.8rem' }} />
            </div>
            <div className="workspace-actions">
              <div className="workspace-loading-button" style={{ width: '8rem', height: '2.75rem' }} />
              <div className="workspace-loading-button" style={{ width: '2.75rem', height: '2.75rem' }} />
            </div>
          </div>

          <div className={`workspace-layout channel-layout student-three-column ${!rightSidebarOpen ? 'sidebar-collapsed' : ''} ${rightPanelMode === 'overlay' ? 'right-panel-overlay' : ''}`}>
            <section className="workspace-main student-workspace-stage">
              <div className="workspace-main-header">
                <div className="workspace-main-title workspace-loading-copy">
                  <div className="workspace-loading-line" style={{ width: '10rem' }} />
                  <div className="workspace-loading-line" style={{ width: '18rem', maxWidth: '85%' }} />
                  <div className="workspace-loading-line" style={{ width: '24rem', maxWidth: '100%', height: '0.8rem' }} />
                </div>
                <div className="workspace-main-toolbar">
                  <div className="workspace-loading-button" style={{ width: '2.75rem', height: '2.75rem' }} />
                  <div className="workspace-loading-button" style={{ width: '2.75rem', height: '2.75rem' }} />
                </div>
              </div>

              <div className="student-document-stage">
                <div className="document-viewer-shell workspace-document-stage">
                  <div className="document-viewer-toolbar">
                    <div className="document-viewer-toolbar-title workspace-loading-copy">
                      <div className="workspace-loading-line" style={{ width: '8.5rem' }} />
                      <div className="workspace-loading-line" style={{ width: '13rem', height: '0.8rem' }} />
                    </div>
                    <div className="workspace-loading-button" style={{ width: '7rem', height: '2.6rem' }} />
                  </div>
                  <div className="document-viewer-frame-shell">
                    <div className="workspace-loading-frame" />
                  </div>
                </div>
              </div>

              <Card className="workspace-card student-workspace-quiz-card">
                <CardBody>
                  <div className="workspace-panel-inline-header">
                    <div className="workspace-loading-copy">
                      <div className="workspace-loading-chip" style={{ width: '6.5rem' }} />
                      <div className="workspace-loading-line" style={{ width: '14rem' }} />
                    </div>
                    <div className="workspace-loading-button" style={{ width: '6.5rem', height: '2.5rem' }} />
                  </div>
                  <div className="workspace-loading-row">
                    <div className="workspace-loading-line" style={{ width: '80%' }} />
                    <div className="workspace-loading-block" style={{ height: '7rem' }} />
                    <div className="workspace-loading-block" style={{ height: '7rem' }} />
                  </div>
                  <div className="workspace-loading-button" style={{ width: '10rem', height: '2.75rem', marginTop: '1rem' }} />
                </CardBody>
              </Card>
            </section>

            {rightSidebarOpen && (
              <>
                {rightPanelMode === 'overlay' && (
                  <button
                    type="button"
                    className="right-panel-backdrop is-visible"
                    aria-label="학습 도구 패널 닫기"
                    onClick={() => toggleRightPanel(false)}
                  />
                )}
                <aside className={`workspace-side student-side student-workspace-side ${rightPanelMode === 'overlay' ? 'student-workspace-side--overlay' : ''}`}>
                  <Card className="workspace-card">
                    <CardBody>
                      <div className="workspace-loading-sidebar">
                        <div className="workspace-loading-row">
                          <div className="workspace-loading-chip" style={{ width: '7rem' }} />
                          <div className="workspace-loading-line" style={{ width: '16rem', maxWidth: '90%' }} />
                          <div className="workspace-loading-block" style={{ height: '4.75rem' }} />
                        </div>
                        <div className="workspace-loading-row">
                          <div className="workspace-loading-chip" style={{ width: '6rem' }} />
                          <div className="workspace-loading-line" style={{ width: '82%' }} />
                          <div className="workspace-loading-block" style={{ height: '6.5rem' }} />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </aside>
              </>
            )}
          </div>
        </div>
        {rightPanelHandle}
      </>
    )
  }
  if (!questionSet || !token) {
    return <div className="error-container"><p>{error ?? '문제 세트를 찾을 수 없습니다.'}</p></div>
  }

  return (
    <div className="workspace-page student-workspace-page">
      <div className="workspace-header">
        <div className="workspace-header-content">
          <div className="workspace-section-meta">학생 · 학습 보조 및 문제 풀이</div>
          <h1 className="page-title">{questionSet.title}</h1>
          <p className="page-description">같은 자료를 보면서 문제를 풀고, 바로 질문할 수 있습니다.</p>
        </div>
        <div className="workspace-actions">
          <Link to="/student"><Button variant="outline">학생 홈</Button></Link>
        </div>
      </div>

      {rightPanelHandle}

      {error && <div className="error-message">{error}</div>}

    <div className={`workspace-layout channel-layout student-three-column ${!rightSidebarOpen ? 'sidebar-collapsed' : ''} ${rightPanelMode === 'overlay' ? 'right-panel-overlay' : ''}`}>
      <section className="workspace-main student-workspace-stage">
          <div className="workspace-main-header">
            <div className="workspace-main-title">
              <div className="workspace-main-title-icon">
                <span className="material-symbols-outlined">auto_stories</span>
              </div>
              <div>
                <div className="workspace-main-eyebrow">학습 문서</div>
                <div>{questionSet.title}</div>
              </div>
            </div>
            <div className="workspace-main-toolbar">
              <button className="workspace-tool-button" type="button" aria-label="bookmark">
                <span className="material-symbols-outlined">bookmark</span>
              </button>
              <button className="workspace-tool-button" type="button" aria-label="search">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </div>
          <div className="student-document-stage student-document-stage--primary">
            <MaterialDocumentViewer materialId={questionSet.materialId} token={token} />
          </div>

        </section>

        {rightSidebarOpen && (
          <>
            {rightPanelMode === 'overlay' && (
              <button
                type="button"
                className="right-panel-backdrop is-visible"
                aria-label="학습 도구 패널 닫기"
                onClick={() => toggleRightPanel(false)}
              />
            )}
            <aside className={`workspace-side student-side student-workspace-side ${rightPanelMode === 'overlay' ? 'student-workspace-side--overlay' : ''}`}>
          <Card className="workspace-card">
            <CardBody>
              <div className="workspace-panel-inline-header">
                <h3 className="workspace-card-title">풀이 요약</h3>
                <span className="workspace-mini-chip">QUIZ</span>
                <Button variant="ghost" size="sm" onClick={() => setIsQuizModalOpen(true)}>
                  문제 풀기 열기
                </Button>
              </div>
              <p className="workspace-side-description">중앙은 학습 문서 집중 상태로 유지하고, 문제 풀이와 AI 질문은 이 패널과 모달에서 이어갑니다.</p>
              <div className="student-quiz-progress-card student-quiz-progress-card--compact">
                <strong>{Object.keys(answers).length} / {questionSet.questions.length} 문항 응답</strong>
                <p>응답 수를 확인한 뒤 중앙 문제 영역에서 계속 풀이하거나, 집중 모드로 크게 볼 수 있습니다.</p>
              </div>
              <div className="student-progress-metrics">
                <div className="student-progress-metric">
                  <span>남은 문항</span>
                  <strong>{questionSet.questions.length - Object.keys(answers).length}</strong>
                </div>
                <div className="student-progress-metric">
                  <span>AI 질문</span>
                  <strong>{Math.floor(qaMessages.length / 2)}</strong>
                </div>
              </div>
              <div className="workspace-sidebar-actions">
                <Button variant="outline" onClick={() => setIsQuizModalOpen(true)}>문제 풀기 열기</Button>
                <Button loading={submitting} onClick={handleSubmit}>정답 제출하기</Button>
              </div>
            </CardBody>
          </Card>

          <Card className="workspace-card workspace-chat-card student-sidebar-chat-card">
            <CardBody>
              {followUpContext && (
                <div className="student-follow-up-callout">
                  <div className="workspace-main-eyebrow">오답 AI 해설 준비됨</div>
                  <strong>문제 {followUpContext.questionNumber}</strong>
                  <p>{followUpContext.prompt}</p>
                  <p className="student-follow-up-meta">
                    선택 답: {followUpContext.selectedOptionLabel}
                    {followUpContext.conceptTags.length > 0 && ` · 관련 개념: ${followUpContext.conceptTags.join(', ')}`}
                  </p>
                  <p className="student-follow-up-explanation">{followUpContext.explanation}</p>
                  <p className="student-follow-up-helper">아래 질문 칸에 자동으로 들어가며, 필요하면 수정해서 다시 물어볼 수 있습니다.</p>
                </div>
              )}
              <div className="workspace-panel-inline-header">
                <h3 className="workspace-card-title">자료 기반 AI 질문</h3>
                <span className="workspace-mini-chip">LIVE</span>
              </div>
              <p className="workspace-side-description">오른쪽 토글 패널 안에서 바로 질문하고, 답변과 근거까지 이 자리에서 확인합니다.</p>
              <div className="workspace-chat-area student-sidebar-chat-log">
                {qaMessages.length === 0 ? (
                  <p className="workspace-empty">자료에 대해 궁금한 점을 질문하면 AI가 바로 답변합니다.</p>
                ) : (
                  qaMessages.map((item) => (
                    <div key={item.id} className={`workspace-chat-bubble ${item.role}`}>
                      {item.content}
                      {item.role === 'assistant' && item.evidenceSnippets && item.evidenceSnippets.length > 0 && (
                        <div className="workspace-evidence-list">
                          {item.evidenceSnippets.map((snippet) => (
                            <div key={`${item.id}-${snippet}`} className="workspace-evidence-item">{snippet}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="workspace-ai-input-area student-sidebar-ai-input">
                <textarea
                  className="textarea"
                  rows={4}
                  maxLength={500}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleQuestionKeyDown}
                  placeholder="질문을 입력하세요 (Enter로 전송, Shift+Enter 줄바꿈)"
                />
                <Button onClick={handleAsk} disabled={!question.trim()} loading={asking} style={{ marginTop: '0.5rem', width: '100%' }}>
                  질문하기
                </Button>
              </div>
            </CardBody>
          </Card>
            </aside>
          </>
        )}
      </div>

      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title="집중 문제 풀이"
        size="xl"
      >
        <div className="workspace-modal-quiz-layout">
          <div className="workspace-questions-list">
            {questionSet.questions.map((item, index) => (
              <div key={item.id} className={`workspace-question-item ${answers[item.id] !== undefined ? 'completed' : ''}`}>
                <div className="workspace-question-number">문제 {index + 1}</div>
                <p className="workspace-question-title">{item.stem}</p>
                <div className="workspace-options-grid">
                        {item.options.map((option, optionIndex) => (
                          <button key={`${item.id}-${option}`} type="button" className={`workspace-option ${answers[item.id] === optionIndex ? 'selected' : ''}`} onClick={() => handleSelectAnswer(item.id, optionIndex)}>
                      <span>{String.fromCharCode(65 + optionIndex)}</span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="workspace-modal-quiz-actions">
            <Button variant="outline" onClick={() => setIsQuizModalOpen(false)}>닫기</Button>
            <Button loading={submitting} onClick={handleSubmit}>정답 제출하기</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
