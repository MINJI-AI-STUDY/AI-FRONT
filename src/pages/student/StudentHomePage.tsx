/**
 * 학생 홈 페이지
 * 액션-우선순위 대시보드 구조
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, SubmissionResultModal } from '../../components'
import { getStudentChannels, getStudentMaterials, type ChannelResponse, type StudentMaterialSummaryResponse } from '../../api/student'
import './StudentPages.css'

/**
 * 학생 홈 페이지 컴포넌트
 * 주요 액션: 문제 세트 참여 → 결과 확인 → AI 학습
 */
export function StudentHomePage() {
  const { user, token } = useAuth()
  const latestSubmissionId = sessionStorage.getItem('latest_submission_id')
  const latestMaterialId = sessionStorage.getItem('latest_material_id')
  const [materials, setMaterials] = useState<StudentMaterialSummaryResponse[]>([])
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)

  useEffect(() => {
    if (!token) return

    const fetchMaterials = async () => {
      try {
        const [materialData, channelData] = await Promise.all([getStudentMaterials(token), getStudentChannels(token)])
        setMaterials(materialData)
        setChannels(channelData)
      } catch (err) {
        console.error('학생 자료 목록 조회 실패:', err)
        setError('학생 홈 데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterials()
  }, [token])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>

  if (error) {
    return <div className="error-container"><p>{error}</p></div>
  }

  // 최근 활동 존재 여부
  const hasRecentSubmission = !!latestSubmissionId
  const hasRecentMaterial = !!latestMaterialId
  const hasChannels = channels.length > 0
  const hasMaterials = materials.length > 0

  return (
    <div className="student-home">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="workspace-chip">학생 학습 공간</div>
        <h1 className="page-title">학습 대시보드</h1>
        <p className="page-description">
          안녕하세요, {user?.displayName}님. 오늘의 학습을 시작하세요.
        </p>
      </div>

      {/* 주요 액션: 빠른 시작 */}
      <section className="dashboard-section">
        <h2 className="section-title">빠른 시작</h2>
        <div className="quick-action-cards">
          <Card className="quick-action-card primary">
            <CardBody>
              <div className="quick-action-content">
                <div className="quick-action-icon primary">📝</div>
                <div className="quick-action-text">
                  <h3 className="quick-action-title">문제 세트 참여하기</h3>
                  <p className="quick-action-description">
                    교사가 공유한 배포 코드를 입력하여 새로운 문제 세트에 참여합니다.
                  </p>
                </div>
              </div>
              <Link to="/student/join">
                <Button variant="primary" size="lg">배포 코드 입력</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* 최근 활동 및 계속하기 */}
      {(hasRecentSubmission || hasRecentMaterial) && (
        <section className="dashboard-section">
          <h2 className="section-title">이어서 하기</h2>
          <div className="action-cards">
            {hasRecentSubmission && (
              <Card className="action-card highlight">
                <CardBody>
                  <div className="action-meta">최근 제출</div>
                  <h3 className="action-title">마지막 결과 확인</h3>
                  <p className="action-description">
                    가장 최근에 제출한 문제 세트의 결과와 해설을 다시 확인합니다.
                  </p>
                  <div className="action-buttons">
                    <Link to={`/student/submissions/${latestSubmissionId}`}>
                      <Button variant="primary">결과 보기</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => setIsResultModalOpen(true)}>모달로 보기</Button>
                  </div>
                </CardBody>
              </Card>
            )}
            {hasRecentMaterial && (
              <Card className="action-card">
                <CardBody>
                  <div className="action-meta">AI 학습 도우미</div>
                  <h3 className="action-title">자료 기반 질문</h3>
                  <p className="action-description">
                    학습 자료를 기반으로 AI에게 질문하고 답변을 받습니다.
                  </p>
                  <Link to={`/student/materials/${latestMaterialId}/qa`}>
                    <Button variant="outline">질문하기</Button>
                  </Link>
                </CardBody>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* 채널 워크스페이스 */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">채널 워크스페이스</h2>
          <span className="section-count">{channels.length}개 참여 중</span>
        </div>
        <div className="action-cards">
          {!hasChannels ? (
            <Card className="action-card empty">
              <CardBody>
                <div className="empty-content">
                  <h3 className="action-title">참여 중인 채널이 없습니다</h3>
                  <p className="action-description">
                    교사가 채널을 생성하고 초대하면 여기에 표시됩니다.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            channels.map((channel) => (
              <Card className="action-card" key={channel.channelId}>
                <CardBody>
                  <div className="action-meta">채널</div>
                  <h3 className="action-title"># {channel.name}</h3>
                  <p className="action-description">{channel.description || '채널 설명 없음'}</p>
                  <Link to={`/student/channels/${channel.channelId}`}>
                    <Button variant="outline">채널 입장</Button>
                  </Link>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* 학교 자료 라이브러리 */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">학습 자료</h2>
          <span className="section-count">{materials.length}개 이용 가능</span>
        </div>
        {!hasMaterials ? (
          <Card className="info-card">
            <CardBody>
              <p className="info-text">
                교사가 업로드한 PDF 자료가 여기에 표시됩니다. 자료를 확인하고 AI에게 질문할 수 있습니다.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="action-cards compact">
            {materials.map((material) => (
              <Card className="action-card compact" key={material.materialId}>
                <CardBody>
                  <div className="compact-card-content">
                    <div className="compact-card-info">
                      <div className="action-meta">문서 #{material.docNo}</div>
                      <h3 className="compact-title">{material.title}</h3>
                    </div>
                    <Link to={`/student/materials/${material.materialId}/qa`}>
                      <Button variant="outline" size="sm">보기</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <SubmissionResultModal 
        submissionId={latestSubmissionId} 
        token={token ?? ''} 
        isOpen={isResultModalOpen} 
        onClose={() => setIsResultModalOpen(false)} 
      />
    </div>
  )
}
