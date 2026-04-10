/**
 * 교사 홈 페이지
 * 교사 기능 진입점
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getMaterials, getTeacherChannels, type ChannelResponse, type MaterialSummaryResponse } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 교사 홈 페이지 컴포넌트
 */
export function TeacherHomePage() {
  const { user, token } = useAuth()
  const [materials, setMaterials] = useState<MaterialSummaryResponse[]>([])
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const fetchMaterials = async () => {
      try {
        const [materialData, channelData] = await Promise.all([getMaterials(token), getTeacherChannels(token)])
        setMaterials(materialData)
        setChannels(channelData)
      } catch (err) {
        console.error('교사 자료 목록 조회 실패:', err)
        setError('교사 홈 데이터를 불러오는데 실패했습니다.')
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
    <div className="teacher-home">
      <div className="page-header">
        <div className="workspace-chip">교사 워크스페이스</div>
        <h1 className="page-title">교사 홈</h1>
        <p className="page-description">
          안녕하세요, {user?.displayName}님. 자료 업로드와 분석 상태 확인을 시작하세요.
        </p>
      </div>

      <div className="action-cards">
        <Card className="action-card">
          <CardBody>
            <div className="action-meta">문서 업로드 · 분석 시작</div>
            <h3 className="action-title">자료 업로드</h3>
            <p className="action-description">PDF 자료를 업로드하고 AI 분석을 요청합니다.</p>
            <Link to="/teacher/materials/new">
              <Button variant="primary">자료 업로드</Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.125rem' }}>채널 워크스페이스</h2>
        <div className="action-cards">
          {channels.length === 0 ? (
            <Card className="action-card"><CardBody><h3 className="action-title">생성된 채널이 없습니다</h3><p className="action-description">첫 채널을 만들면 워크스페이스가 여기에 표시됩니다.</p></CardBody></Card>
          ) : channels.map((channel) => (
            <Card className="action-card" key={channel.channelId}>
              <CardBody>
                <div className="action-meta">채널</div>
                <h3 className="action-title"># {channel.name}</h3>
                <p className="action-description">{channel.description || '채널 설명 없음'}</p>
                <Link to={`/teacher/channels/${channel.channelId}`}><Button variant="outline">채널 열기</Button></Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.125rem' }}>내 업로드 자료</h2>
        <div className="action-cards">
          {materials.length === 0 ? (
            <Card className="action-card"><CardBody><h3 className="action-title">업로드한 자료가 없습니다</h3><p className="action-description">첫 PDF를 업로드해 학생과 같은 문서를 공유하세요.</p></CardBody></Card>
          ) : materials.map((material) => (
            <Card className="action-card" key={material.materialId}>
              <CardBody>
                <div className="action-meta">문서 #{material.docNo} · {material.status}</div>
                <h3 className="action-title">{material.title}</h3>
                <p className="action-description">{material.description || '설명 없음'}</p>
                <Link to={`/teacher/materials/${material.materialId}`}><Button variant="outline">상세 보기</Button></Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
