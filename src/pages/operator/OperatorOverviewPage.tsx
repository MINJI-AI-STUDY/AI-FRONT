/**
 * 운영자 대시보드 페이지
 * F5: 운영자 요약 대시보드
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Card, CardBody } from '../../components'
import { getOperatorOverview, type OperatorOverviewResponse } from '../../api/operator'
import './OperatorPages.css'

export function OperatorOverviewPage() {
  const [overview, setOverview] = useState<OperatorOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, token } = useAuth()

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('로그인이 필요합니다.')
      return
    }

    const fetchOverview = async () => {
      try {
        const data = await getOperatorOverview(token)
        setOverview(data)
      } catch (err) {
        console.error('개요 조회 실패:', err)
        setError('데이터를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [token])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !overview) return <div className="error-container"><p>{error || '데이터를 찾을 수 없습니다.'}</p></div>

  return (
    <div className="operator-overview-page">
      <div className="page-header">
        <h1 className="page-title">운영자 대시보드</h1>
        <p className="page-description">안녕하세요, {user?.displayName}님. 전체 현황을 확인하세요.</p>
      </div>

      <div className="summary-grid">
        <Card className="summary-card"><CardBody><h3 className="summary-title">평균 점수</h3><p className="summary-value">{overview.averageScore.toFixed(1)}점</p></CardBody></Card>
        <Card className="summary-card"><CardBody><h3 className="summary-title">참여율</h3><p className="summary-value">{overview.participationRate.toFixed(1)}%</p></CardBody></Card>
        <Card className="summary-card"><CardBody><h3 className="summary-title">완료율</h3><p className="summary-value">{overview.completionRate.toFixed(1)}%</p></CardBody></Card>
      </div>
    </div>
  )
}
