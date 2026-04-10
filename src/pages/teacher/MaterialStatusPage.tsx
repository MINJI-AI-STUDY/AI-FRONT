/**
 * 자료 상태 페이지
 * F2: 자료 처리 상태 확인 및 재시도
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getMaterial, retryMaterial } from '../../api/teacher'
import type { MaterialStatus, MaterialSummaryResponse } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 상태 배지 컴포넌트
 */
function StatusBadge({ status }: { status: MaterialStatus }) {
  const statusConfig: Record<MaterialStatus, { label: string; className: string }> = {
    UPLOADED: { label: '업로드됨', className: 'status-uploaded' },
    PROCESSING: { label: '처리 중', className: 'status-processing' },
    READY: { label: '준비됨', className: 'status-ready' },
    FAILED: { label: '실패', className: 'status-failed' },
  }

  const config = statusConfig[status]
  return <span className={`status-badge ${config.className}`}>{config.label}</span>
}

/**
 * 자료 상태 페이지 컴포넌트
 */
export function MaterialStatusPage() {
  const { materialId } = useParams<{ materialId: string }>()
  const [material, setMaterial] = useState<MaterialSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  /**
   * 자료 정보 조회
   */
  useEffect(() => {
    if (!materialId || !token) return

    let intervalId: number | undefined

    const fetchMaterial = async () => {
      try {
        const data = await getMaterial(materialId, token)
        setMaterial(data)

        if (data.status === 'PROCESSING' || data.status === 'UPLOADED') {
          if (!intervalId) {
            intervalId = window.setInterval(fetchMaterial, 3000)
          }
        } else if (intervalId) {
          window.clearInterval(intervalId)
          intervalId = undefined
        }
      } catch (err) {
        console.error('자료 조회 실패:', err)
        setError('자료 정보를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [materialId, token])

  /**
   * 재시도 핸들러
   */
  const handleRetry = async () => {
    if (!materialId || !token) return

    setRetrying(true)
    setError(null)
    try {
      const data = await retryMaterial(materialId, token)
      setMaterial(data)
    } catch (err) {
      console.error('재시도 실패:', err)
      setError('재시도에 실패했습니다.')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  }

  if (!material) {
    return <div className="error-container"><p>자료를 찾을 수 없습니다.</p><Link to="/teacher"><Button variant="outline">목록으로</Button></Link></div>
  }

  return (
    <div className="material-status-page">
      <div className="page-header">
        <h1 className="page-title">{material.title}</h1>
        <StatusBadge status={material.status} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <Card>
        <CardBody>
          <div className="material-info">
            <div className="info-row"><span className="info-label">문서 번호</span><span className="info-value">#{material.docNo}</span></div>
            <div className="info-row"><span className="info-label">자료 ID</span><span className="info-value">{material.materialId}</span></div>
            <div className="info-row"><span className="info-label">설명</span><span className="info-value">{material.description || '-'}</span></div>
            {material.failureReason && <div className="info-row"><span className="info-label">실패 사유</span><span className="info-value error-text">{material.failureReason}</span></div>}
          </div>

          {material.status === 'FAILED' && (
            <div className="failed-actions">
              <p className="failed-message">자료 처리에 실패했습니다. 다시 시도해주세요.</p>
              <Button variant="danger" loading={retrying} onClick={handleRetry}>재시도</Button>
            </div>
          )}

          {material.status === 'READY' && (
            <div className="ready-actions">
              <p className="ready-message">자료가 준비되었습니다. 분석이 완료된 상태입니다.</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/teacher/materials/${material.materialId}/workspace`}><Button variant="primary">공통 워크스페이스 열기</Button></Link>
                <Link to={`/teacher/materials/${material.materialId}/dashboard`}><Button variant="outline">문서 대시보드 보기</Button></Link>
              </div>
            </div>
          )}

          {material.status === 'PROCESSING' && (
            <div className="processing-message">
              <p>자료를 처리 중입니다. 3초마다 상태를 자동으로 다시 확인합니다.</p>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="page-actions">
        <Link to="/teacher"><Button variant="outline">목록으로</Button></Link>
      </div>
    </div>
  )
}
