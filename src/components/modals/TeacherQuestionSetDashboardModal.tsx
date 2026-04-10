import { useEffect, useState } from 'react'
import { Card, CardBody, Modal } from '..'
import { getTeacherDashboard, type TeacherDashboardResponse } from '../../api/teacher'

interface TeacherQuestionSetDashboardModalProps {
  questionSetId: string | null
  token: string
  isOpen: boolean
  onClose: () => void
}

export function TeacherQuestionSetDashboardModal({ questionSetId, token, isOpen, onClose }: TeacherQuestionSetDashboardModalProps) {
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !questionSetId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setDashboard(await getTeacherDashboard(questionSetId, token))
      } catch (err) {
        console.error('문제 세트 대시보드 모달 조회 실패:', err)
        setError('문제 세트 대시보드를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, questionSetId, token])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="문제 세트 대시보드" size="xl">
      {loading && <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>}
      {error && <div className="error-container"><p>{error}</p></div>}
      {!loading && !error && dashboard && (
        <div className="teacher-dashboard-page">
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
        </div>
      )}
    </Modal>
  )
}
