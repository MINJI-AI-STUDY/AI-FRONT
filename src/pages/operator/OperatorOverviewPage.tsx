/**
 * 운영자 대시보드 페이지 (MVP: 학교 관리자 스코프)
 * F5: 운영자 요약 대시보드 - 가입 승인 및 현황 확인 중심
 * MVP 범위: 승인 워크플로우 및 대시보드 조회만 제공
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getOperatorOverview, type OperatorOverviewResponse } from '../../api/operator'
import './OperatorPages.css'

export function OperatorOverviewPage() {
  const [overview, setOverview] = useState<OperatorOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, token, logout } = useAuth()

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('로그인이 필요합니다.')
      return
    }

    const fetchOverview = async () => {
      try {
        const overviewData = await getOperatorOverview(token)
        setOverview(overviewData)
      } catch (err) {
        console.error('개요 조회 실패:', err)
        setError('데이터를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [token])

  const handleLogout = async () => {
    await logout()
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error || !overview) return <div className="error-container"><p>{error || '데이터를 찾을 수 없습니다.'}</p></div>

  const hasOverviewData = overview.averageScore > 0 || overview.participationRate > 0 || overview.completionRate > 0

  return (
    <div className="operator-overview-page">
      <div className="page-header">
        <h1 className="page-title">운영자 대시보드</h1>
        <p className="page-description">안녕하세요, {user?.displayName}님. 내가 관리하는 학교 범위의 현황을 확인하세요.</p>
        <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
      </div>

      {/* MVP: 가입 승인 바로가기 - 핵심 워크플로우 */}
      <Card className="summary-card" style={{ marginBottom: '1rem' }}>
        <CardBody>
          <h3 className="summary-title">가입 승인 관리</h3>
          <p className="page-description" style={{ marginBottom: '0.75rem' }}>교직원 및 학생의 가입 요청을 검토하고 승인합니다.</p>
          <Link to="/operator/signup-requests">
            <Button variant="primary">가입 승인 페이지로 이동</Button>
          </Link>
        </CardBody>
      </Card>

      {!hasOverviewData ? (
        <Card className="summary-card">
          <CardBody>
            <div className="empty-state">
              <h3 className="summary-title">아직 집계할 데이터가 없습니다</h3>
              <p className="page-description">학생 제출이 누적되면 평균 점수, 참여율, 완료율이 표시됩니다.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="summary-grid">
          <Card className="summary-card"><CardBody><h3 className="summary-title">평균 점수</h3><p className="summary-value">{overview.averageScore.toFixed(1)}점</p></CardBody></Card>
          <Card className="summary-card"><CardBody><h3 className="summary-title">참여율</h3><p className="summary-value">{overview.participationRate.toFixed(1)}%</p></CardBody></Card>
          <Card className="summary-card"><CardBody><h3 className="summary-title">완료율</h3><p className="summary-value">{overview.completionRate.toFixed(1)}%</p></CardBody></Card>
        </div>
      )}
    </div>
  )
}
