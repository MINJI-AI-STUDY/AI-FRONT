/**
 * 학생 공통 자료 워크스페이스
 * 같은 PDF를 중심으로 문제 풀이와 채팅형 QA를 함께 봅니다.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer, Modal } from '../../components'
import { askQuestion, getQuestionSet, submitAnswers } from '../../api/student'
import type { QaResponse, StudentQuestionSetResponse } from '../../api/student'
import '../WorkspacePages.css'

interface AnswerState {
  [questionId: string]: number
}

export function StudentWorkspacePage() {
  const { distributionCode } = useParams<{ distributionCode: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [questionSet, setQuestionSet] = useState<StudentQuestionSetResponse | null>(null)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [question, setQuestion] = useState('')
  const [qaResponse, setQaResponse] = useState<QaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false)

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
      const result = await askQuestion(questionSet.materialId, { question: trimmedQuestion }, token)
      setQaResponse(result)
    } catch (err) {
      console.error('질의응답 실패:', err)
      setError('질의응답에 실패했습니다.')
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
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

      {error && <div className="error-message">{error}</div>}

      <div className="workspace-layout">
        <section className="workspace-main">
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
          <MaterialDocumentViewer materialId={questionSet.materialId} token={token} />
        </section>

        <aside className="workspace-side student-side">
          <Card className="workspace-card">
            <CardBody>
              <div className="workspace-panel-inline-header">
                <h3 className="workspace-card-title">빠른 문제 풀이</h3>
                <span className="workspace-mini-chip">QUIZ</span>
                <Button variant="ghost" size="sm" onClick={() => setIsQuizModalOpen(true)}>
                  집중 모드
                </Button>
              </div>
              <div className="workspace-questions-list">
                {questionSet.questions.map((item, index) => (
                  <div key={item.id} className="workspace-question-item">
                    <p className="workspace-question-title">문제 {index + 1}. {item.stem}</p>
                    <div className="workspace-options-grid">
                      {item.options.map((option, optionIndex) => (
                        <button key={optionIndex} type="button" className={`workspace-option ${answers[item.id] === optionIndex ? 'selected' : ''}`} onClick={() => handleSelectAnswer(item.id, optionIndex)}>
                          <span>{String.fromCharCode(65 + optionIndex)}</span>
                          <span>{option}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button loading={submitting} onClick={handleSubmit}>정답 제출하기</Button>
            </CardBody>
          </Card>

          <Card className="workspace-card workspace-chat-card">
            <CardBody>
              <div className="workspace-panel-inline-header">
                <h3 className="workspace-card-title">자료 기반 AI 질문</h3>
                <span className="workspace-mini-chip">LIVE</span>
              </div>
              <div className="workspace-chat-area">
                {qaResponse ? (
                  <>
                    <div className="workspace-chat-bubble user">{question}</div>
                    <div className="workspace-chat-bubble assistant">{qaResponse.answer}</div>
                    {qaResponse.evidenceSnippets.length > 0 && (
                      <div className="workspace-evidence-list">
                        {qaResponse.evidenceSnippets.map((snippet, index) => (
                          <div key={index} className="workspace-evidence-item">{snippet}</div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="workspace-empty">질문을 입력하면 답변과 근거가 여기에 표시됩니다.</p>
                )}
              </div>
              <div className="workspace-chat-form">
                <textarea className="textarea" rows={3} maxLength={500} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="자료를 보면서 궁금한 점을 입력하세요" />
                <Button loading={asking} onClick={handleAsk}>질문하기</Button>
              </div>
            </CardBody>
          </Card>
        </aside>
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
                    <button key={optionIndex} type="button" className={`workspace-option ${answers[item.id] === optionIndex ? 'selected' : ''}`} onClick={() => handleSelectAnswer(item.id, optionIndex)}>
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
