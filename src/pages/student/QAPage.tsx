/**
 * 자료 기반 AI 도우미
 * F6: 자료 근거 기반 질문과 답변
 */

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer } from '../../components'
import { askQuestion, getMyQaLogs } from '../../api/student'
import type { QaResponse, StudentQaLogResponse } from '../../api/student'
import { classifyAiResponse, AI_RESPONSE_MESSAGES, getUserFacingErrorMessage } from '../../api/aiResponse'
import './StudentPages.css'

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

  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()

  useEffect(() => {
    if (!materialId || !token) return

    const fetchLogs = async () => {
      try {
        const logs = await getMyQaLogs(materialId, token)
        setHistory(logs)
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

  return (
    <div className="qa-page">
      <div className="page-header">
        <h1 className="page-title">자료 기반 AI 도우미</h1>
        <p className="page-description">학습 자료를 기반으로 질문에 답변합니다. 자료에 근거한 답변과 근거 부족 안내를 제공합니다.</p>
      </div>

      {materialId && token && (
        <Card className="response-card">
          <CardBody>
            <h3 className="response-title">학습 자료</h3>
            <div style={{ minHeight: '480px' }}>
              <MaterialDocumentViewer materialId={materialId} token={token} />
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
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
{history.length === 0 ? (
<div className="workspace-empty" style={{ textAlign: 'center', padding: '2rem 0' }}>
<p style={{ marginBottom: '0.5rem' }}>아직 질문 이력이 없습니다.</p>
<p className="page-description" style={{ fontSize: '0.875rem' }}>자료에 대해 궁금한 점을 질문하면 AI가 답변합니다.</p>
            </div>
          ) : (
<div className="evidence-list">
{history.map((log) => (
<div key={log.qaLogId} className="evidence-item">
<p className="response-answer" style={{ fontWeight: 600 }}>{log.question}</p>
<p className="response-answer">{log.answer}</p>
</div>
))}
</div>
)}
        </CardBody>
      </Card>
    </div>
  )
}
