/**
 * 자료 기반 AI 도우미
 * F6: 자료 근거 기반 질문과 답변
 */

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer } from '../../components'
import { askQuestion, getMyQaLogs, getStudentMaterials } from '../../api/student'
import type { QaResponse, StudentMaterialSummaryResponse, StudentQaLogResponse } from '../../api/student'
import { classifyAiResponse, AI_RESPONSE_MESSAGES, getUserFacingErrorMessage } from '../../api/aiResponse'
import type { AiResponseState } from '../../api/aiResponse'
import './StudentPages.css'

function formatLogTime(createdAt: string) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getHistoryState(log: StudentQaLogResponse): AiResponseState {
  if (log.status === 'AI_UNAVAILABLE') return 'runtimeFailure'
  if (!log.grounded) return 'insufficientEvidence'
  return 'grounded'
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

function QaResponseCard({ response }: { response: QaResponse }) {
  const state = classifyAiResponse(response)
  const messages = AI_RESPONSE_MESSAGES[state]
  const badgeClass = state === 'grounded' ? 'correct' : 'wrong'

  return (
    <Card className="response-card">
      <CardBody>
        <div className={`result-badge ${badgeClass}`} style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
          {messages.badge}
        </div>
        <h3 className="response-title">AI 답변</h3>
        <p className="response-answer">{response.answer}</p>

        {state === 'grounded' && response.evidenceSnippets.length > 0 && (
          <div className="evidence-section">
            <h4 className="evidence-title">근거</h4>
            <div className="evidence-list">
              {response.evidenceSnippets.map((snippet, index) => (
                <div key={index} className="evidence-item">
                  <p className="evidence-content">{snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {state !== 'grounded' && (
          <div className="no-evidence">
            <p>{messages.description} {messages.action}</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export function QAPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<QaResponse | null>(null)
  const [history, setHistory] = useState<StudentQaLogResponse[]>([])
  const [materials, setMaterials] = useState<StudentMaterialSummaryResponse[]>([])
  const [followUpContext, setFollowUpContext] = useState<StudentAiFollowUpContext | null>(null)

  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()

  useEffect(() => {
    const context = consumeStudentAiFollowUpContext()
    if (!context) return

    setFollowUpContext(context)
    setQuestion(context.prompt)
  }, [])

  useEffect(() => {
    if (!materialId || !token) return

    const fetchLogs = async () => {
      try {
        const [logs, materialList] = await Promise.all([
          getMyQaLogs(materialId, token),
          getStudentMaterials(token),
        ])
        setHistory(logs)
        setMaterials(materialList)
      } catch (err) {
        console.error('질문 이력 조회 실패:', err)
      }
    }

    fetchLogs()
  }, [materialId, token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResponse(null)

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      setError('질문을 입력해주세요.')
      return
    }
    if (trimmedQuestion.length > 500) {
      setError('질문은 500자 이내로 입력해주세요.')
      return
    }
    if (!materialId || !token) {
      setError('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    try {
      const result = await askQuestion(materialId, { question: trimmedQuestion }, token)
      setResponse(result)
      const logs = await getMyQaLogs(materialId, token)
      setHistory(logs)
    } catch (err) {
      console.error('질의응답 실패:', err)
      setError(getUserFacingErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const currentMaterial = materials.find((item) => item.materialId === materialId) ?? null
  const recentHistory = history.slice(0, 6)

  return (
    <div className="qa-page">
      <div className="page-header">
        <div className="workspace-chip">자료 기반 AI 도우미</div>
        <h1 className="page-title">자료 기반 AI 도우미</h1>
        <p className="page-description">현재 보고 있는 학습 자료를 바탕으로 질문에 답합니다. 답변 전에는 먼저 자료 맥락을 확인하고, 필요하면 새 탭에서 PDF를 열어 함께 보세요.</p>
      </div>

      {currentMaterial && (
        <Card className="material-context-card">
          <CardBody>
            <div className="material-context-header">
              <div>
                <div className="action-meta">현재 학습 자료</div>
                <h3 className="material-context-title">{currentMaterial.title}</h3>
                <p className="material-context-description">{currentMaterial.description || '설명이 아직 등록되지 않았습니다. 문서 내용을 바탕으로 질문해 보세요.'}</p>
              </div>
              <div className="material-context-actions">
                <span className="material-context-docno">문서 #{currentMaterial.docNo}</span>
                <Link to="/student">
                  <Button variant="ghost" size="sm">대시보드로 돌아가기</Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {materialId && token && (
        <Card className="response-card">
          <CardBody>
            <h3 className="response-title">학습 자료</h3>
            <p className="page-description" style={{ marginBottom: '1rem' }}>먼저 문서를 훑어본 뒤 질문하면 더 정확한 도움을 받을 수 있습니다.</p>
            <div style={{ minHeight: '480px' }}>
              <MaterialDocumentViewer materialId={materialId} token={token} />
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
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
              <p className="student-follow-up-helper">질문 칸에 자동으로 들어가며, 필요하면 수정해서 다시 물어볼 수 있습니다.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="qa-form">
            <div className="form-group">
              <label className="input-label">질문</label>
              <textarea className="textarea" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="자료에 대해 궁금한 점을 질문하세요 (Enter로 전송, 최대 500자)" rows={4} maxLength={500} />
              <span className="char-count">{question.length} / 500</span>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <Button type="submit" loading={loading}>질문하기</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {response && (
        <QaResponseCard response={response} />
      )}

        <Card className="response-card">
          <CardBody>
            <h3 className="response-title">내 질문 이력</h3>
            <p className="page-description" style={{ marginBottom: '1rem' }}>최근 질문 6개만 보여줍니다. 근거 부족과 시스템 오류는 배지로 구분됩니다.</p>
            {recentHistory.length === 0 ? (
              <div className="workspace-empty qa-history-empty">
                <p style={{ marginBottom: '0.5rem' }}>아직 질문 이력이 없습니다.</p>
                <p className="page-description" style={{ fontSize: '0.875rem' }}>자료를 읽다가 막히는 부분을 질문하면 AI가 학습 자료 기준으로 설명해드립니다.</p>
              </div>
            ) : (
              <div className="qa-history-list">
                {recentHistory.map((log) => {
                  const state = getHistoryState(log)
                  const messages = AI_RESPONSE_MESSAGES[state]

                  return (
                    <div key={log.qaLogId} className="qa-history-item">
                      <div className="qa-history-header">
                        <div>
                          <p className="qa-history-question">{log.question}</p>
                          <span className="qa-history-time">{formatLogTime(log.createdAt)}</span>
                        </div>
                        <span className={`qa-history-badge ${state}`}>{messages.badge}</span>
                      </div>
                      <p className="qa-history-answer">{log.answer}</p>
                    </div>
                  )
                })}
              </div>
            )}
        </CardBody>
      </Card>
    </div>
  )
}
