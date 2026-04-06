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

  useEffect(() => {
    if (!submissionId || !token) return

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

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !result) return <div className="error-container"><p>{error || '결과를 찾을 수 없습니다.'}</p><Link to="/student"><Button variant="outline">홈으로</Button></Link></div>

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
        {result.questionResults.map((question, index) => (
          <Card key={question.questionId} className={`result-card ${question.correct ? 'correct' : 'wrong'}`}>
            <CardBody>
              <div className="result-header">
                <span className="result-number">문제 {index + 1}</span>
                <span className={`result-badge ${question.correct ? 'correct' : 'wrong'}`}>{question.correct ? '정답' : '오답'}</span>
              </div>
              <div className="result-answer"><p><strong>선택한 답:</strong> {String.fromCharCode(65 + question.selectedOptionIndex)}</p></div>
              <div className="result-explanation"><strong>해설:</strong> {question.explanation}</div>
              {question.conceptTags.length > 0 && (
                <div className="result-tags"><strong>관련 개념:</strong> {question.conceptTags.map((tag) => <span key={tag} className="concept-tag">{tag}</span>)}</div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {result.explanations.length > 0 && (
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
