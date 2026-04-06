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

  return (
    <div className="teacher-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">교사 대시보드</h1>
        <p className="page-description">학생별 점수, 문항별 정답률, 취약개념을 확인합니다.</p>
      </div>

      <Card className="results-card">
        <CardBody>
          <h2 className="section-title">학생별 점수</h2>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>학생 ID</th><th>점수</th></tr></thead>
              <tbody>{dashboard.studentScores.map((result) => <tr key={result.studentId}><td>{result.studentId}</td><td>{result.score}</td></tr>)}</tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Card className="accuracy-card">
        <CardBody>
          <h2 className="section-title">문항별 정답률</h2>
          <div className="accuracy-list">
            {dashboard.questionAccuracy.map((acc, index) => (
              <div key={acc.questionId} className="accuracy-item">
                <div className="accuracy-header"><span className="question-num">문제 {index + 1}</span><span className="accuracy-value">{acc.accuracyRate.toFixed(0)}%</span></div>
                <div className="accuracy-bar"><div className="accuracy-fill" style={{ width: `${acc.accuracyRate}%` }} /></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {dashboard.weakConceptTags.length > 0 && (
        <Card className="concepts-card">
          <CardBody>
            <h2 className="section-title">취약개념</h2>
            <div className="concept-tags">{dashboard.weakConceptTags.map((concept) => <span key={concept.tag} className="concept-tag">{concept.tag} ({concept.count})</span>)}</div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
