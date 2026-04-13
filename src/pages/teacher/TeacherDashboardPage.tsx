/**
 * 교사 대시보드 페이지
 * F5: 학생별 점수, 문항별 정답률, 취약개념 확인
 */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Card, CardBody } from '../../components'
import { getTeacherDashboard } from '../../api/teacher'
import type { TeacherDashboardResponse } from '../../api/teacher'
import './TeacherPages.css'

export function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { questionSetId } = useParams<{ questionSetId: string }>()
  const { token } = useAuth()

  useEffect(() => {
    if (!questionSetId || !token) return

    const fetchDashboard = async () => {
      try {
        const data = await getTeacherDashboard(questionSetId, token)
        setDashboard(data)
      } catch (err) {
        console.error('대시보드 조회 실패:', err)
        setError('대시보드 데이터를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [questionSetId, token])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !dashboard) return <div className="error-container"><p>{error || '데이터를 찾을 수 없습니다.'}</p></div>

  const hasSubmissionData = dashboard.studentScores.length > 0
  const questionCount = dashboard.questionAccuracy.length || Math.max(...dashboard.studentScores.map((item) => item.score), 0)
  const averageScore = hasSubmissionData
    ? dashboard.studentScores.reduce((sum, item) => sum + item.score, 0) / dashboard.studentScores.length
    : 0
  const highestScore = hasSubmissionData ? Math.max(...dashboard.studentScores.map((item) => item.score)) : 0
  const studentRanking = [...dashboard.studentScores].sort((a, b) => b.score - a.score)
  const riskQuestions = [...dashboard.questionAccuracy].sort((a, b) => a.accuracyRate - b.accuracyRate)
  const topRiskQuestions = riskQuestions.slice(0, 3)
  const topWeakConcepts = dashboard.weakConceptTags.slice(0, 5)

  return (
    <div className="teacher-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">교사 대시보드</h1>
        <p className="page-description">학생 제출 상황을 먼저 요약하고, 위험 문항과 취약 개념을 우선순위대로 읽을 수 있게 정리했습니다.</p>
      </div>

      {!hasSubmissionData ? (
        <Card className="results-card">
          <CardBody>
            <div className="empty-state">
              <h2 className="section-title">아직 제출 데이터가 없습니다</h2>
              <p className="page-description">학생 제출이 발생하면 점수, 정답률, 취약개념이 여기에 표시됩니다.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card className="results-card">
            <CardBody>
              <div className="section-header">
                <h2 className="section-title">한눈에 보는 제출 현황</h2>
                <span className="section-count">{dashboard.studentScores.length}명 제출</span>
              </div>
              <p className="section-helper">태블릿 가로에서도 먼저 봐야 할 수치만 위로 올렸습니다.</p>
              <div className="summary-grid teacher-dashboard-summary-grid">
                <div className="info-row">
                  <span className="info-label">평균 점수</span>
                  <span className="info-value">{averageScore.toFixed(1)} / {questionCount || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">최고 점수</span>
                  <span className="info-value">{highestScore}점</span>
                </div>
                <div className="info-row">
                  <span className="info-label">위험 문항</span>
                  <span className="info-value">
                    {topRiskQuestions[0]
                      ? `${riskQuestions.findIndex((item) => item.questionId === topRiskQuestions[0].questionId) + 1}번 · ${topRiskQuestions[0].accuracyRate.toFixed(0)}%`
                      : '없음'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">상위 학생</span>
                  <span className="info-value">{studentRanking[0]?.studentId ?? '-'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="accuracy-card">
            <CardBody>
              <div className="section-header">
                <h2 className="section-title">위험 문항 우선</h2>
                <span className="section-count">{dashboard.questionAccuracy.length}문항</span>
              </div>
              <p className="section-helper">정답률이 낮은 문제를 먼저 위로 배치했습니다.</p>
              <div className="teacher-risk-grid">
                {topRiskQuestions.map((acc) => (
                  <div key={`risk-${acc.questionId}`} className="teacher-risk-card">
                    <span className="teacher-risk-card-label">문제 {riskQuestions.findIndex((item) => item.questionId === acc.questionId) + 1}</span>
                    <strong>{acc.accuracyRate.toFixed(0)}%</strong>
                    <p>가장 먼저 다시 설명하거나 복습시킬 후보입니다.</p>
                  </div>
                ))}
              </div>
              <div className="accuracy-list">
                {riskQuestions.map((acc) => (
                  <div key={acc.questionId} className="accuracy-item">
                    <div className="accuracy-header">
                      <span className="question-num">문제 {riskQuestions.findIndex((item) => item.questionId === acc.questionId) + 1}</span>
                      <span className="accuracy-value">{acc.accuracyRate.toFixed(0)}%</span>
                    </div>
                    <div className="accuracy-bar"><div className="accuracy-fill" style={{ width: `${acc.accuracyRate}%` }} /></div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="results-card">
            <CardBody>
              <div className="section-header">
                <h2 className="section-title">학생별 풀이 순위</h2>
                <span className="section-count">최신 제출 기준</span>
              </div>
              <div className="teacher-student-ranking">
                {studentRanking.map((result, index) => {
                  const progress = questionCount > 0 ? (result.score / questionCount) * 100 : 0
                  const normalizedProgress = progress === 0 ? 0 : Math.max(6, progress)
                  return (
                    <div key={result.studentId} className="teacher-student-row">
                      <div className="teacher-student-rank">{index + 1}</div>
                      <div className="teacher-student-copy">
                        <div className="teacher-student-header">
                          <strong>{result.studentId}</strong>
                          <span>{result.score} / {questionCount || '-'}</span>
                        </div>
                        <div className="teacher-student-progress">
                          <div className="teacher-student-progress-fill" style={{ width: `${normalizedProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          <Card className="concepts-card">
            <CardBody>
              <div className="section-header">
                <h2 className="section-title">취약 개념</h2>
                <span className="section-count">{dashboard.weakConceptTags.length}개</span>
              </div>
              {topWeakConcepts.length > 0 ? (
                <div className="concept-tags">
                  {topWeakConcepts.map((concept) => <span key={concept.tag} className="concept-tag">{concept.tag} ({concept.count})</span>)}
                </div>
              ) : (
                <p className="page-description">아직 취약 개념 집계가 없습니다.</p>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
