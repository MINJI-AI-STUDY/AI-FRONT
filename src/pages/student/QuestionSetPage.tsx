/**
 * 문제 풀이 페이지
 * F4: 객관식 문제 풀이 및 제출
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getQuestionSet, submitAnswers } from '../../api/student'
import type { StudentQuestionResponse, StudentQuestionSetResponse } from '../../api/student'
import './StudentPages.css'

interface AnswerState {
  [questionId: string]: number
}

export function QuestionSetPage() {
  const [questionSet, setQuestionSet] = useState<StudentQuestionSetResponse | null>(null)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { distributionCode } = useParams<{ distributionCode: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!distributionCode || !token) return

    const fetchQuestionSet = async () => {
      try {
        const data = await getQuestionSet(distributionCode, token)
        setQuestionSet(data)
      } catch (err) {
        console.error('문제 세트 조회 실패:', err)
        setError('문제 세트를 가져오는데 실패했습니다.')
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
    if (!distributionCode || !token) {
      setError('로그인이 필요합니다.')
      return
    }
    if (!questionSet) return

    const unansweredQuestion = questionSet.questions.find((q) => answers[q.id] === undefined)
    if (unansweredQuestion) {
      setError('모든 문제에 답을 선택해주세요.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const submitData = {
        answers: questionSet.questions.map((q) => ({ questionId: q.id, selectedOptionIndex: answers[q.id] })),
      }
      const result = await submitAnswers(distributionCode, submitData, token)
      sessionStorage.setItem('latest_submission_id', result.submissionId)
      sessionStorage.setItem('latest_material_id', questionSet.materialId)
      navigate(`/student/submissions/${result.submissionId}`)
    } catch (err) {
      console.error('답안 제출 실패:', err)
      setError('답안 제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error && !questionSet) return <div className="error-container"><p>{error}</p><Button variant="outline" onClick={() => navigate('/student')}>홈으로</Button></div>
  if (!questionSet) return <div className="error-container"><p>문제 세트를 찾을 수 없습니다.</p><Button variant="outline" onClick={() => navigate('/student')}>홈으로</Button></div>

  const isExpired = questionSet.dueAt && new Date(questionSet.dueAt) < new Date()
  const unansweredCount = questionSet.questions.filter((q) => answers[q.id] === undefined).length

  return (
    <div className="question-set-page">
      <div className="page-header">
        <h1 className="page-title">{questionSet.title}</h1>
        {questionSet.dueAt && <p className="deadline">마감: {new Date(questionSet.dueAt).toLocaleString()}</p>}
        <p className="page-description">자료 ID: {questionSet.materialId}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isExpired && <div className="expired-message"><p>마감된 문제 세트입니다.</p></div>}

      {!isExpired && (
        <div className="progress-summary">
          <p>
            현재 <strong>{questionSet.questions.length - unansweredCount}</strong> / <strong>{questionSet.questions.length}</strong> 문항에 응답했습니다.
          </p>
          <p className="progress-helper">미응답 문항 수: {unansweredCount}개</p>
        </div>
      )}

      <div className="questions-list">
        {questionSet.questions.map((question, qIndex) => (
          <QuestionCard key={question.id} question={question} index={qIndex + 1} selectedAnswer={answers[question.id]} onSelect={handleSelectAnswer} disabled={!!isExpired || submitting} />
        ))}
      </div>

      {!isExpired && (
        <div className="submit-actions">
          {submitting && <p className="submit-message">답안을 제출하고 채점 중입니다. 잠시만 기다려주세요.</p>}
          <Button variant="primary" loading={submitting} onClick={handleSubmit} disabled={questionSet.questions.some((q) => answers[q.id] === undefined)}>제출하기</Button>
        </div>
      )}
    </div>
  )
}

interface QuestionCardProps {
  question: StudentQuestionResponse
  index: number
  selectedAnswer: number | undefined
  onSelect: (questionId: string, answerIndex: number) => void
  disabled: boolean
}

function QuestionCard({ question, index, selectedAnswer, onSelect, disabled }: QuestionCardProps) {
  return (
    <Card className="question-card">
      <CardBody>
        <div className="question-number">문제 {index}</div>
        <p className="question-stem">{question.stem}</p>
        <div className="options-list">
          {question.options.map((option, oIndex) => (
            <label key={oIndex} className={`option-item ${selectedAnswer === oIndex ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
              <input type="radio" name={`question-${question.id}`} value={oIndex} checked={selectedAnswer === oIndex} onChange={() => onSelect(question.id, oIndex)} disabled={disabled} />
              <span className="option-label">{String.fromCharCode(65 + oIndex)}.</span>
              <span className="option-text">{option}</span>
            </label>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
