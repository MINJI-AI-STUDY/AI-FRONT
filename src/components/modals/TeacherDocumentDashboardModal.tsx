import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardBody, Modal } from '..'
import { getDocumentDashboard, type DocumentDashboardResponse } from '../../api/teacher'

interface TeacherDocumentDashboardModalProps {
  materialId: string | null
  token: string
  isOpen: boolean
  onClose: () => void
}

export function TeacherDocumentDashboardModal({ materialId, token, isOpen, onClose }: TeacherDocumentDashboardModalProps) {
  const [dashboard, setDashboard] = useState<DocumentDashboardResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !materialId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setDashboard(await getDocumentDashboard(materialId, token))
      } catch (err) {
        console.error('문서 대시보드 모달 조회 실패:', err)
        setError('문서 대시보드를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, materialId, token])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="문서 대시보드 미리보기" size="xl">
      {loading && <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>}
      {error && <div className="error-container"><p>{error}</p></div>}
      {!loading && !error && dashboard && (
        <div className="teacher-dashboard-preview">
          <Card className="results-card">
            <CardBody>
              <div className="preview-header" data-testid="current-document-summary">
                <div>
                  <div className="action-meta">미리보기</div>
                  <h2 className="section-title" data-testid="current-document-title">{dashboard.material.title}</h2>
                  <p className="section-helper">상세 페이지로 들어가기 전에 문서 번호, 처리 상태, 문항 규모만 빠르게 훑는 축약판입니다.</p>
                </div>
                <span className={`status-badge-mini status-${dashboard.material.status.toLowerCase()}`}>
                  {dashboard.material.status === 'READY' && '분석 완료'}
                  {dashboard.material.status === 'PROCESSING' && '처리 중'}
                  {dashboard.material.status === 'FAILED' && '실패'}
                  {dashboard.material.status === 'UPLOADED' && '업로드됨'}
                </span>
              </div>

              <div className="material-info preview-info-grid">
                <div className="info-row"><span className="info-label">문서 번호</span><span className="info-value">#{dashboard.material.docNo}</span></div>
                <div className="info-row"><span className="info-label">문항 세트 수</span><span className="info-value">{dashboard.questionSetCount}</span></div>
                <div className="info-row"><span className="info-label">생성 문항 수</span><span className="info-value">{dashboard.questionCount}</span></div>
                <div className="info-row"><span className="info-label">제출 수</span><span className="info-value">{dashboard.submissionCount}</span></div>
                <div className="info-row"><span className="info-label">참여 학생 수</span><span className="info-value">{dashboard.participantCount}</span></div>
                <div className="info-row"><span className="info-label">최근 질문 수</span><span className="info-value">{dashboard.qaCount}</span></div>
              </div>

              <div className="preview-actions">
                <Link to={`/teacher/materials/${dashboard.material.materialId}/dashboard`}>
                  <Button variant="primary" data-testid="open-document-dashboard-btn">상세 대시보드 열기</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Modal>
  )
}
