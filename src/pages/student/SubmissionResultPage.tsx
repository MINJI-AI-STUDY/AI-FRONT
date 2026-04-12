/**
 * 결과/해설 페이지
 * F5: 학생 결과 확인
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getSubmissionResult } from '../../api/student'
import type { StudentResultResponse } from '../../api/student'
import './StudentPages.css'

export function SubmissionResultPage() {
  const [result, setResult] = useState<StudentResultResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { submissionId } = useParams<{ submissionId: string }>()
  const { token } = useAuth()
  const latestMaterialId = sessionStorage.getItem('latest_material_id')
  const latestDistributionCode = sessionStorage.getItem('latest_distribution_code')

  const followUpPath = latestDistributionCode
    ? `/student/question-sets/${latestDistributionCode}/workspace`
    : latestMaterialId
      ? `/student/materials/${latestMaterialId}/qa`
      : '/student'

  const storeWrongAnswerContext = (questionNumber: number, explanation: string, selectedOptionLabel: string, conceptTags: string[]) => {
    sessionStorage.setItem(
      'student_ai_followup_context',
      JSON.stringify({
        questionNumber,
        explanation,
        selectedOptionLabel,
        conceptTags,
        prompt: `문제 ${questionNumber}에서 내가 고른 ${selectedOptionLabel}가 왜 틀렸는지 자료 기준으로 짧고 친절하게 설명해 주세요.`,
      }),
    )
  }

  const createFallbackExplanation = (questionNumber: number) =>
    `문제 ${questionNumber}의 자세한 해설이 아직 준비되지 않았습니다. AI 해설 요청으로 추가 설명을 받아보세요.`

  useEffect(() => {
    if (!submissionId) {
      setLoading(false)
      setError('결과를 찾을 수 없습니다.')
      return
    }
    if (!token) {
      setLoading(false)
      setError('로그인이 필요합니다.')
      return
    }

    const fetchResult = async () => {
      try {
        const data = await getSubmissionResult(submissionId, token)
        setResult(data)
      } catch (err) {
        console.error('결과 조회 실패:', err)
        setError('결과를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [submissionId, token])

  if (loading) {
    return (
      <div className="modal-status-state">
        <div className="loading-spinner" />
        <p className="modal-status-title">결과를 불러오는 중입니다.</p>
        <p className="modal-status-description">제출한 답안을 다시 확인하고 있어요.</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="modal-status-state modal-status-state--error">
        <p className="modal-status-title">결과를 찾을 수 없습니다.</p>
        <p className="modal-status-description">{error || '제출 결과가 아직 준비되지 않았습니다.'}</p>
        <div className="page-actions page-actions--stacked">
          <Link to="/student"><Button variant="outline">홈으로</Button></Link>
          {submissionId && <Link to={`/student/submissions/${submissionId}`}><Button variant="primary">다시 시도</Button></Link>}
        </div>
      </div>
    )
  }

  const correctCount = result.questionResults.filter((r) => r.correct).length
  const totalQuestions = result.questionResults.length

  return (
    <div className="submission-result-page">
      <div className="page-header">
        <h1 className="page-title">결과 확인</h1>
        <p className="page-description">점수와 해설을 확인하세요.</p>
      </div>

      <Card className="score-card">
        <CardBody>
          <div className="score-display">
            <div className="score-value">{result.score} / {totalQuestions}</div>
            <div className="score-label">점수</div>
          </div>
          <div className="score-stats">
            <div className="stat-item"><span className="stat-value correct">{correctCount}</span><span className="stat-label">정답</span></div>
            <div className="stat-item"><span className="stat-value wrong">{totalQuestions - correctCount}</span><span className="stat-label">오답</span></div>
          </div>
        </CardBody>
      </Card>

      <div className="results-list">
        {result.questionResults.map((question, index) => {
          const conceptTags = Array.isArray(question.conceptTags) ? question.conceptTags : []

          return (
            <Card key={question.questionId} className={`result-card ${question.correct ? 'correct' : 'wrong'}`}>
              <CardBody>
                <div className="result-header">
                  <span className="result-number">문제 {index + 1}</span>
                  <span className={`result-badge ${question.correct ? 'correct' : 'wrong'}`}>{question.correct ? '정답' : '오답'}</span>
                </div>
                <div className="result-answer"><p><strong>선택한 답:</strong> {String.fromCharCode(65 + question.selectedOptionIndex)}</p></div>
                <div className="result-explanation"><strong>해설:</strong> {question.explanation?.trim() || createFallbackExplanation(index + 1)}</div>
                {conceptTags.length > 0 && (
                  <div className="result-tags"><strong>관련 개념:</strong> {conceptTags.map((tag) => <span key={tag} className="concept-tag">{tag}</span>)}</div>
                )}
                {!question.correct && (
                  <div className="result-follow-up">
                    <div className="result-follow-up-text">이 오답은 AI에게 다시 물어볼 수 있습니다. 선택한 답과 해설을 함께 보내 더 친절한 설명을 받아보세요.</div>
                    <div className="page-actions page-actions--stacked">
                      <Link
                        to={followUpPath}
                        onClick={() => storeWrongAnswerContext(index + 1, question.explanation?.trim() || createFallbackExplanation(index + 1), String.fromCharCode(65 + question.selectedOptionIndex), conceptTags)}
                      >
                        <Button variant="outline">오답 AI 해설 요청</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )
        })}
      </div>

      {Array.isArray(result.explanations) && result.explanations.length > 0 && (
        <Card className="explanations-card">
          <CardBody>
            <h2 className="section-title">전체 해설</h2>
            <div className="explanations-list">
              {result.explanations.map((explanation, index) => <div key={index} className="explanation-item"><strong>문제 {index + 1}:</strong> {explanation}</div>)}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="page-actions">
        {latestMaterialId && (
          <Link to={latestDistributionCode ? `/student/question-sets/${latestDistributionCode}/workspace` : `/student/materials/${latestMaterialId}/qa`}><Button variant="primary">같은 자료로 질문하기</Button></Link>
        )}
        <Link to="/student"><Button variant="outline">홈으로</Button></Link>
      </div>
    </div>
  )
}
