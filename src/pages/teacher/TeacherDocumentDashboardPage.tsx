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

  const primaryQuestionSet = dashboard.generatedQuestionSets[0]
  const recentQaLogs = dashboard.recentQaLogs.slice(0, 3)

  return (
    <div className="teacher-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">문서 대시보드</h1>
        <p className="page-description">현재 문서 상태를 먼저 보고, 문제세트로 이동한 뒤, 최근 질문 흐름을 빠르게 훑는 교사용 문서 허브입니다.</p>
      </div>

      <Card className="results-card">
        <CardBody>
          <div className="summary-header">
            <div>
              <div className="action-meta">현재 문서</div>
              <h2 className="section-title" data-testid="current-document-title">{dashboard.material.title}</h2>
              <p className="section-helper">문서 번호 #{dashboard.material.docNo} · 상태와 문제세트 흐름을 한눈에 확인합니다.</p>
            </div>
            <span className={`status-badge-mini status-${dashboard.material.status.toLowerCase()}`}>
              {dashboard.material.status === 'READY' && '분석 완료'}
              {dashboard.material.status === 'PROCESSING' && '처리 중'}
              {dashboard.material.status === 'FAILED' && '실패'}
              {dashboard.material.status === 'UPLOADED' && '업로드됨'}
            </span>
          </div>

          <div className="material-info summary-grid">
            <div className="info-row"><span className="info-label">문서 번호</span><span className="info-value">#{dashboard.material.docNo}</span></div>
            <div className="info-row"><span className="info-label">문항 세트 수</span><span className="info-value">{dashboard.questionSetCount}</span></div>
            <div className="info-row"><span className="info-label">생성 문항 수</span><span className="info-value">{dashboard.questionCount}</span></div>
            <div className="info-row"><span className="info-label">제출 수</span><span className="info-value">{dashboard.submissionCount}</span></div>
            <div className="info-row"><span className="info-label">참여 학생 수</span><span className="info-value">{dashboard.participantCount}</span></div>
            <div className="info-row"><span className="info-label">평균 점수</span><span className="info-value">{dashboard.averageScore.toFixed(1)}</span></div>
            <div className="info-row"><span className="info-label">학생 질문 수</span><span className="info-value">{dashboard.qaCount}</span></div>
          </div>

        <div className="summary-actions">
            <Link to={`/teacher/materials/${dashboard.material.materialId}`}>
              <Button variant="outline">문서 상태로 돌아가기</Button>
            </Link>
            <Link to={`/teacher/materials/${dashboard.material.materialId}/workspace`}>
              <Button variant="primary" data-testid="open-workspace-action">워크스페이스로 이동</Button>
            </Link>
            {primaryQuestionSet && (
              <Link to={`/teacher/question-sets/${primaryQuestionSet.questionSetId}/dashboard`}>
                <Button variant="primary">가장 최근 문제세트로 이동</Button>
              </Link>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="results-card">
        <CardBody>
          <div className="section-header">
            <h2 className="section-title">문제세트 이동</h2>
            <span className="section-count">{dashboard.generatedQuestionSets.length}개</span>
          </div>
          <p className="section-helper">교사는 여기서 가장 최근 세트를 먼저 열고, 필요하면 목록의 다른 세트로 옮겨가면 됩니다.</p>
          {dashboard.generatedQuestionSets.length === 0 ? (
            <p className="page-description">아직 생성된 문제 세트가 없습니다.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>문제세트</th><th>상태</th><th>문항 수</th><th>배포 코드</th><th>이동</th></tr></thead>
                <tbody>
                  {dashboard.generatedQuestionSets.map((item) => (
                    <tr key={item.questionSetId}>
                      <td>
                        <div className="table-primary-cell">
                          <strong>{item.questionSetId}</strong>
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge-mini status-${item.status.toLowerCase()}`}>
                          {item.status === 'REVIEW_REQUIRED' && '검토 필요'}
                          {item.status === 'PUBLISHED' && '배포됨'}
                          {item.status === 'CLOSED' && '종료'}
                        </span>
                      </td>
                      <td>{item.questionCount}</td>
                      <td>{item.distributionCode ?? '-'}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/teacher/question-sets/${item.questionSetId}/dashboard`}>
                            <Button variant="outline" size="sm">대시보드로 이동</Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setModalQuestionSetId(item.questionSetId)}>미리보기</Button>
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
          <div className="section-header">
            <h2 className="section-title">최근 질문 흐름</h2>
            <span className="section-count">최근 {recentQaLogs.length}개</span>
          </div>
          <p className="section-helper">학생이 어떤 질문을 했고, 답변이 어떻게 이어졌는지 최신순으로 읽기 쉽게 정리했습니다.</p>
          {dashboard.recentQaLogs.length === 0 ? (
            <p className="page-description">아직 저장된 질문 로그가 없습니다.</p>
          ) : (
            <div className="accuracy-list">
              {recentQaLogs.map((log) => (
                <div key={log.qaLogId} className="accuracy-item">
                  <div className="accuracy-header">
                    <span className="question-num">{log.studentId}</span>
                    <span className="accuracy-value">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="question-text">{log.question}</p>
                  <p className="answer-text">{log.answer}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <TeacherQuestionSetDashboardModal questionSetId={modalQuestionSetId} token={token ?? ''} isOpen={!!modalQuestionSetId} onClose={() => setModalQuestionSetId(null)} />
    </div>
  )
}
