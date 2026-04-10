/**
 * 학생 홈 페이지
 * 학생 기능 진입점
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getStudentChannels, getStudentMaterials, type ChannelResponse, type StudentMaterialSummaryResponse } from '../../api/student'
import './StudentPages.css'

/**
 * 학생 홈 페이지 컴포넌트
 */
export function StudentHomePage() {
  const { user, token } = useAuth()
  const latestSubmissionId = sessionStorage.getItem('latest_submission_id')
  const latestMaterialId = sessionStorage.getItem('latest_material_id')
  const [materials, setMaterials] = useState<StudentMaterialSummaryResponse[]>([])
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="student-home">
      <div className="page-header">
        <div className="workspace-chip">학생 학습 공간</div>
        <h1 className="page-title">학생 홈</h1>
        <p className="page-description">안녕하세요, {user?.displayName}님. 배포 코드로 문제 세트에 참여하세요.</p>
      </div>

      <div className="action-cards">
        <Card className="action-card">
          <CardBody>
            <div className="action-meta">문제 세트 참여</div>
            <h3 className="action-title">문제 세트 참여</h3>
            <p className="action-description">교사가 공유한 배포 코드를 입력하여 문제 세트에 참여합니다.</p>
            <Link to="/student/join">
              <Button variant="primary">배포 코드 입력</Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="action-card">
          <CardBody>
            <div className="action-meta">최근 제출 결과</div>
            <h3 className="action-title">결과 확인</h3>
            <p className="action-description">가장 최근에 제출한 문제 세트의 결과와 해설을 확인합니다.</p>
            <Link to={latestSubmissionId ? `/student/submissions/${latestSubmissionId}` : '/student/join'}>
              <Button variant="outline">{latestSubmissionId ? '최근 결과 보기' : '먼저 문제 참여'}</Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="action-card">
          <CardBody>
            <div className="action-meta">동일 자료 질문</div>
            <h3 className="action-title">자료 기반 AI 질의응답</h3>
            <p className="action-description">가장 최근에 풀이한 자료를 기준으로 질문할 수 있습니다.</p>
            <Link to={latestMaterialId ? `/student/materials/${latestMaterialId}/qa` : '/student'}>
              <Button variant="outline" disabled={!latestMaterialId}>{latestMaterialId ? '자료 질문하기' : '먼저 문제 참여'}</Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.125rem' }}>채널 입장</h2>
        <div className="action-cards" style={{ marginBottom: '1rem' }}>
          {channels.length === 0 ? (
            <Card className="action-card"><CardBody><h3 className="action-title">참여 가능한 채널이 없습니다</h3><p className="action-description">교사가 채널을 만들면 여기에 표시됩니다.</p></CardBody></Card>
          ) : channels.map((channel) => (
            <Card className="action-card" key={channel.channelId}>
              <CardBody>
                <div className="action-meta">채널</div>
                <h3 className="action-title"># {channel.name}</h3>
                <p className="action-description">{channel.description || '채널 설명 없음'}</p>
                <Link to={`/student/channels/${channel.channelId}`}><Button variant="outline">채널 입장</Button></Link>
              </CardBody>
            </Card>
          ))}
        </div>
        <h2 className="page-title" style={{ fontSize: '1.125rem' }}>같은 학교 자료</h2>
        <p className="page-description" style={{ marginBottom: '1rem' }}>교사가 업로드해 준비 완료된 PDF가 자동으로 표시됩니다.</p>
        <div className="action-cards">
          {materials.length === 0 ? (
            <Card className="action-card">
              <CardBody>
                <h3 className="action-title">표시할 자료가 없습니다</h3>
                <p className="action-description">교사가 PDF를 업로드하고 분석이 완료되면 여기에 자동으로 나타납니다.</p>
              </CardBody>
            </Card>
          ) : materials.map((material) => (
            <Card className="action-card" key={material.materialId}>
              <CardBody>
                <div className="action-meta">문서 #{material.docNo}</div>
                <h3 className="action-title">{material.title}</h3>
                <p className="action-description">{material.description || '설명 없음'}</p>
                <Link to={`/student/materials/${material.materialId}/qa`}>
                  <Button variant="outline">문서 보고 질문하기</Button>
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
