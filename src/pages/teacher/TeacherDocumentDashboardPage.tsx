import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Card, CardBody, Button, TeacherQuestionSetDashboardModal } from '../../components'
import { getDocumentDashboard } from '../../api/teacher'
import type { DocumentDashboardResponse } from '../../api/teacher'
import './TeacherPages.css'

export function TeacherDocumentDashboardPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState<DocumentDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalQuestionSetId, setModalQuestionSetId] = useState<string | null>(null)

  useEffect(() => {
    if (!materialId || !token) return

    const fetchDashboard = async () => {
      try {
        const data = await getDocumentDashboard(materialId, token)
        setDashboard(data)
      } catch (err) {
        console.error('문서 대시보드 조회 실패:', err)
        setError('문서 대시보드를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [materialId, token])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !dashboard) return <div className="error-container"><p>{error || '데이터를 찾을 수 없습니다.'}</p></div>

  return (
    <div className="teacher-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">문서 대시보드</h1>
        <p className="page-description">문서 번호 #{dashboard.material.docNo} · 생성 문제 · 제출 현황 · 학생 질문 로그를 확인합니다.</p>
      </div>

      <Card className="results-card">
        <CardBody>
          <h2 className="section-title">문서 요약</h2>
          <div className="material-info">
            <div className="info-row"><span className="info-label">문서 번호</span><span className="info-value">#{dashboard.material.docNo}</span></div>
            <div className="info-row"><span className="info-label">문항 세트 수</span><span className="info-value">{dashboard.questionSetCount}</span></div>
            <div className="info-row"><span className="info-label">생성 문항 수</span><span className="info-value">{dashboard.questionCount}</span></div>
            <div className="info-row"><span className="info-label">제출 수</span><span className="info-value">{dashboard.submissionCount}</span></div>
            <div className="info-row"><span className="info-label">참여 학생 수</span><span className="info-value">{dashboard.participantCount}</span></div>
            <div className="info-row"><span className="info-label">평균 점수</span><span className="info-value">{dashboard.averageScore.toFixed(1)}</span></div>
            <div className="info-row"><span className="info-label">학생 질문 수</span><span className="info-value">{dashboard.qaCount}</span></div>
          </div>
        </CardBody>
      </Card>

      <Card className="results-card">
        <CardBody>
          <h2 className="section-title">생성된 문제 세트</h2>
          {dashboard.generatedQuestionSets.length === 0 ? (
            <p className="page-description">아직 생성된 문제 세트가 없습니다.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>세트 ID</th><th>상태</th><th>문항 수</th><th>배포 코드</th><th>바로가기</th></tr></thead>
                <tbody>
                  {dashboard.generatedQuestionSets.map((item) => (
                    <tr key={item.questionSetId}>
                      <td>{item.questionSetId}</td>
                      <td>{item.status}</td>
                      <td>{item.questionCount}</td>
                      <td>{item.distributionCode ?? '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Link to={`/teacher/question-sets/${item.questionSetId}/dashboard`}>문제세트 대시보드</Link>
                          <Button variant="ghost" onClick={() => setModalQuestionSetId(item.questionSetId)}>모달 보기</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="results-card">
        <CardBody>
          <h2 className="section-title">최근 학생 질문</h2>
          {dashboard.recentQaLogs.length === 0 ? (
            <p className="page-description">아직 저장된 질문 로그가 없습니다.</p>
          ) : (
            <div className="accuracy-list">
              {dashboard.recentQaLogs.map((log) => (
                <div key={log.qaLogId} className="accuracy-item">
                  <div className="accuracy-header"><span className="question-num">{log.studentId}</span><span className="accuracy-value">{new Date(log.createdAt).toLocaleString()}</span></div>
                  <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>{log.question}</p>
                  <p style={{ margin: 0 }}>{log.answer}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="page-actions">
        <Link to={`/teacher/materials/${dashboard.material.materialId}`}><Button variant="outline">문서 상태로 돌아가기</Button></Link>
      </div>
      <TeacherQuestionSetDashboardModal questionSetId={modalQuestionSetId} token={token ?? ''} isOpen={!!modalQuestionSetId} onClose={() => setModalQuestionSetId(null)} />
    </div>
  )
}
