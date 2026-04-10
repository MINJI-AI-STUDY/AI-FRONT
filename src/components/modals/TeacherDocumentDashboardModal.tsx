import { useEffect, useState } from 'react'
import { Card, CardBody, Modal } from '..'
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
    <Modal isOpen={isOpen} onClose={onClose} title="문서 대시보드" size="xl">
      {loading && <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>}
      {error && <div className="error-container"><p>{error}</p></div>}
      {!loading && !error && dashboard && (
        <div className="teacher-dashboard-page">
          <Card className="results-card">
            <CardBody>
              <h2 className="section-title">문서 요약</h2>
              <div className="material-info">
                <div className="info-row"><span className="info-label">문서 번호</span><span className="info-value">#{dashboard.material.docNo}</span></div>
                <div className="info-row"><span className="info-label">문항 세트 수</span><span className="info-value">{dashboard.questionSetCount}</span></div>
                <div className="info-row"><span className="info-label">생성 문항 수</span><span className="info-value">{dashboard.questionCount}</span></div>
                <div className="info-row"><span className="info-label">제출 수</span><span className="info-value">{dashboard.submissionCount}</span></div>
                <div className="info-row"><span className="info-label">참여 학생 수</span><span className="info-value">{dashboard.participantCount}</span></div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </Modal>
  )
}
