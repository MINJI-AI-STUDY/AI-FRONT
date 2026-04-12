/**
 * 교사 홈 페이지
 * 액션-우선순위 대시보드 구조
 */

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, TeacherDocumentDashboardModal } from '../../components'
import { createChannel, getMaterials, getTeacherChannels, type ChannelResponse, type MaterialSummaryResponse } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 교사 홈 페이지 컴포넌트
 * 주요 액션: 자료 업로드 → 채널 관리 → 학생 진행 모니터링
 */
export function TeacherHomePage() {
  const { user, token } = useAuth()
  const [materials, setMaterials] = useState<MaterialSummaryResponse[]>([])
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newChannelName, setNewChannelName] = useState('')
  const [creatingChannel, setCreatingChannel] = useState(false)
  const [modalMaterialId, setModalMaterialId] = useState<string | null>(null)

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

  const handleCreateFirstChannel = async () => {
    if (!token || !newChannelName.trim()) return
    setCreatingChannel(true)
    try {
      const created = await createChannel({ name: newChannelName.trim(), description: '교사 홈에서 생성한 채널', sortOrder: channels.length + 1 }, token)
      setChannels((prev) => [...prev, created])
      setNewChannelName('')
    } catch (err) {
      console.error('채널 생성 실패:', err)
      setError('채널 생성에 실패했습니다.')
    } finally {
      setCreatingChannel(false)
    }
  }

  // 상태별 자료 수 계산
  const processingCount = materials.filter(m => m.status === 'PROCESSING').length
  const failedCount = materials.filter(m => m.status === 'FAILED').length
  const readyCount = materials.filter(m => m.status === 'READY').length
  const hasChannels = channels.length > 0
  const hasMaterials = materials.length > 0
  const firstReadyMaterial = materials.find((material) => material.status === 'READY')

  return (
    <div className="teacher-home">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="workspace-chip">교사 워크스페이스</div>
        <h1 className="page-title">교사 대시보드</h1>
        <p className="page-description">
          안녕하세요, {user?.displayName}님. 학습 자료를 관리하고 학생들의 진행 상황을 모니터링하세요.
        </p>
      </div>

      {/* 상태 요약 */}
      {hasMaterials && (
        <section className="dashboard-section">
          <div className="status-summary">
            <div className="status-item">
              <span className="status-value">{materials.length}</span>
              <span className="status-label">총 자료</span>
            </div>
            <div className="status-item">
              <span className="status-value ready">{readyCount}</span>
              <span className="status-label">분석 완료</span>
            </div>
            <div className="status-item">
              <span className="status-value processing">{processingCount}</span>
              <span className="status-label">처리 중</span>
            </div>
            {failedCount > 0 && (
              <div className="status-item">
                <span className="status-value failed">{failedCount}</span>
                <span className="status-label">처리 실패</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 주요 액션: 빠른 시작 */}
      <section className="dashboard-section">
        <h2 className="section-title">빠른 액션</h2>
        <div className="quick-action-cards">
          <Card className="quick-action-card primary">
            <CardBody>
              <div className="quick-action-content">
                <div className="quick-action-icon primary">📄</div>
                <div className="quick-action-text">
                  <h3 className="quick-action-title">새 자료 업로드</h3>
                  <p className="quick-action-description">
                    PDF 파일을 업로드하고 AI 분석을 시작합니다. 학생들이 학습할 수 있도록 준비합니다.
                  </p>
                </div>
              </div>
              <Link to="/teacher/materials/new">
                <Button variant="primary" size="lg">자료 업로드</Button>
              </Link>
            </CardBody>
          </Card>

          <Card className="quick-action-card secondary">
            <CardBody>
              <div className="quick-action-content">
                <div className="quick-action-icon secondary">📊</div>
                <div className="quick-action-text">
                  <h3 className="quick-action-title">문제 세트 생성</h3>
                  <p className="quick-action-description">
                    업로드한 자료를 기반으로 AI가 문제 세트를 자동 생성합니다.
                  </p>
                </div>
              </div>
              <Link to={firstReadyMaterial ? `/teacher/materials/${firstReadyMaterial.materialId}/generate` : '/teacher'}>
                <Button variant="outline" size="lg">{firstReadyMaterial ? '문제 생성 시작' : '준비된 자료 확인'}</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* 채널 워크스페이스 */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">채널 워크스페이스</h2>
          <span className="section-count">{channels.length}개 운영 중</span>
        </div>
        <div className="action-cards">
          {!hasChannels ? (
            <Card className="action-card empty">
              <CardBody>
                <div className="empty-content">
                  <h3 className="action-title">생성된 채널이 없습니다</h3>
                  <p className="action-description">
                    첫 채널을 만들면 학생들을 초대하고 학습 활동을 시작할 수 있습니다.
                  </p>
                  <div className="form-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
                    <input 
                      className="number-input" 
                      value={newChannelName} 
                      onChange={(e) => setNewChannelName(e.target.value)} 
                      placeholder="첫 채널 이름 입력" 
                    />
                  </div>
                  <Button 
                    variant="primary" 
                    loading={creatingChannel} 
                    onClick={handleCreateFirstChannel}
                    disabled={!newChannelName.trim()}
                  >
                    채널 만들기
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <>
              {channels.map((channel) => (
                <Card className="action-card" key={channel.channelId}>
                  <CardBody>
                    <div className="action-meta">채널</div>
                    <h3 className="action-title"># {channel.name}</h3>
                    <p className="action-description">{channel.description || '채널 설명 없음'}</p>
                    <Link to={`/teacher/channels/${channel.channelId}`}>
                      <Button variant="outline">채널 열기</Button>
                    </Link>
                  </CardBody>
                </Card>
              ))}
              <Card className="action-card add-new">
                <CardBody>
                  <div className="add-new-content">
                    <h3 className="action-title">+ 새 채널 만들기</h3>
                    <p className="action-description">새로운 학습 그룹을 위한 채널을 생성합니다.</p>
                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                      <input 
                        className="number-input" 
                        value={newChannelName} 
                        onChange={(e) => setNewChannelName(e.target.value)} 
                        placeholder="채널 이름" 
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      loading={creatingChannel} 
                      onClick={handleCreateFirstChannel}
                      disabled={!newChannelName.trim()}
                    >
                      생성하기
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* 내 업로드 자료 */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">내 업로드 자료</h2>
          {materials[0] && (
            <Link to={`/teacher/materials/${materials[0].materialId}`}>
              <Button variant="ghost" size="sm">첫 자료 보기</Button>
            </Link>
          )}
        </div>
        {!hasMaterials ? (
          <Card className="info-card">
            <CardBody>
              <div className="empty-content">
                <h3 className="action-title">업로드한 자료가 없습니다</h3>
                <p className="action-description">
                  첫 PDF를 업로드하면 AI가 자동 분석하고 학생들과 공유할 수 있습니다.
                </p>
                <Link to="/teacher/materials/new">
                  <Button variant="primary">첫 자료 업로드</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="materials-list">
            {materials.slice(0, 5).map((material) => (
              <Card className="material-item-card" key={material.materialId}>
                <CardBody>
                  <div className="material-item-content">
                    <div className="material-item-info">
                      <div className="material-item-header">
                        <h3 className="material-item-title">{material.title}</h3>
                        <span className={`status-badge-mini status-${material.status.toLowerCase()}`}>
                          {material.status === 'READY' && '분석 완료'}
                          {material.status === 'PROCESSING' && '처리 중'}
                          {material.status === 'FAILED' && '실패'}
                          {material.status === 'UPLOADED' && '업로드됨'}
                        </span>
                      </div>
                      <p className="material-item-meta">문서 #{material.docNo} · {material.description || '설명 없음'}</p>
                    </div>
                    <div className="material-item-actions">
                      <Link to={`/teacher/materials/${material.materialId}`}>
                        <Button variant="outline" size="sm">상세</Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => setModalMaterialId(material.materialId)}>미리보기</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
            {materials.length > 5 && (
              <div className="more-items-link">
                <Link to={`/teacher/materials/${materials[0].materialId}`}>
                  <Button variant="ghost">+ {materials.length - 5}개 더 보기</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      <TeacherDocumentDashboardModal 
        materialId={modalMaterialId} 
        token={token ?? ''} 
        isOpen={!!modalMaterialId} 
        onClose={() => setModalMaterialId(null)} 
      />
    </div>
  )
}
