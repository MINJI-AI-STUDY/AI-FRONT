import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, ChannelSidebar, Input, MaterialDocumentViewer, Modal } from '../../components'
import { useWorkspaceShell } from '../../hooks/useWorkspaceShell'
import {
  createChannel,
  generateQuestionsInChannel,
  getQuestionSetById,
  getQuestionSetsByChannel,
  getTeacherDashboard,
  publishQuestionSet,
  getTeacherChannelWorkspace,
  getTeacherChannels,
  updateQuestion,
  updateChannel,
  uploadMaterial,
  type ChannelMessageResponse,
  type ChannelParticipantResponse,
  type ChannelResponse,
  type ChannelWorkspaceResponse,
  type QuestionSetResponse,
  type TeacherDashboardResponse,
  type UpdateQuestionRequest,
} from '../../api/teacher'
import { enterChannel, heartbeatChannel, leaveChannel, subscribeChannelEvents } from '../../api/realtime'
import type { ChannelEventResponse } from '../../api/realtime_types'
import '../WorkspacePages.css'
import './TeacherPages.css'

export function TeacherChannelWorkspacePage() {
  const { channelId } = useParams<{ channelId: string }>()
  const { token } = useAuth()
  const [channels, setChannels] = useState<ChannelResponse[]>([])
  const [workspace, setWorkspace] = useState<ChannelWorkspaceResponse | null>(null)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null)
  const [channelNameDraft, setChannelNameDraft] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionSets, setQuestionSets] = useState<QuestionSetResponse[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [generateModalOpen, setGenerateModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [generating, setGenerating] = useState(false)
  const [reviewQuestionSet, setReviewQuestionSet] = useState<QuestionSetResponse | null>(null)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSavingQuestionId, setReviewSavingQuestionId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [reviewDueAt, setReviewDueAt] = useState('')
  const [publishCode, setPublishCode] = useState<string | null>(null)
  const [latestPublishedDashboard, setLatestPublishedDashboard] = useState<TeacherDashboardResponse | null>(null)
  const [latestPublishedDashboardLoading, setLatestPublishedDashboardLoading] = useState(false)
  const {
    leftSidebarOpen,
    rightPanelOpen,
    rightPanelMode,
    toggleLeftSidebar,
    toggleRightPanel,
    leftPanelMode,
  } = useWorkspaceShell({ stateScopeKey: `teacher-channel-${channelId ?? 'unknown'}` })

  useEffect(() => {
    if (!token || !channelId) return

    const load = async () => {
      try {
        const [channelData, workspaceData] = await Promise.all([
          getTeacherChannels(token),
          getTeacherChannelWorkspace(channelId, token),
        ])

        setChannels(channelData)
        setWorkspace(workspaceData)
        setSelectedMaterialId(workspaceData.materials[0]?.materialId ?? null)
        setChannelNameDraft(workspaceData.channel.name)

        await enterChannel(channelId, token)
      } catch (err) {
        console.error('교사 채널 워크스페이스 로드 실패:', err)
        setError('채널 운영 화면을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    load()

    const interval = setInterval(() => heartbeatChannel(channelId, token), 15000)
    const eventSource = subscribeChannelEvents(channelId, token, (event: ChannelEventResponse) => {
      setWorkspace((prev) => {
        if (!prev) return prev
        if (event.type === 'presence' || event.type === 'ready') {
          return { ...prev, participants: event.participants ?? prev.participants }
        }
        if (event.type === 'message' && event.message) {
          return { ...prev, recentMessages: [...prev.recentMessages, event.message as ChannelMessageResponse] }
        }
        return prev
      })
    })

    return () => {
      clearInterval(interval)
      eventSource.close()
      leaveChannel(channelId, token).catch(() => undefined)
    }
  }, [channelId, token])


  const selectedMaterial = useMemo(
    () => workspace?.materials.find((item) => item.materialId === selectedMaterialId) ?? workspace?.materials[0] ?? null,
    [selectedMaterialId, workspace],
  )

  useEffect(() => {
    if (selectedMaterialId || !workspace?.materials.length) return
    setSelectedMaterialId(workspace.materials[0].materialId)
  }, [selectedMaterialId, workspace?.materials])

  useEffect(() => {
    if (!token || !channelId) {
      setQuestionSets([])
      return
    }

    const loadQuestionSets = async () => {
      try {
        const data = await getQuestionSetsByChannel(channelId, token)
        setQuestionSets(data)
      } catch (err) {
        console.error('문제 세트 목록 조회 실패:', err)
        setQuestionSets([])
      }
    }

    loadQuestionSets()
  }, [channelId, token])

  const latestQuestionSet = questionSets[0] ?? null
  const latestReviewRequiredQuestionSet = questionSets.find((item) => item.status === 'REVIEW_REQUIRED') ?? null
  const latestPublishedQuestionSet = questionSets.find((item) => item.status === 'PUBLISHED') ?? null
  const recentTeacherMessages = [...(workspace?.recentMessages ?? [])].slice(-5).reverse()
  const latestPublishedDashboardSummary = useMemo(() => {
    if (!latestPublishedDashboard) return null

    const participantCount = latestPublishedDashboard.studentScores.length
    const averageScore = participantCount > 0
      ? latestPublishedDashboard.studentScores.reduce((sum, item) => sum + item.score, 0) / participantCount
      : 0
    const topStudent = [...latestPublishedDashboard.studentScores].sort((a, b) => b.score - a.score)[0] ?? null
    const riskQuestion = [...latestPublishedDashboard.questionAccuracy].sort((a, b) => a.accuracyRate - b.accuracyRate)[0] ?? null
    const strongestQuestion = [...latestPublishedDashboard.questionAccuracy].sort((a, b) => b.accuracyRate - a.accuracyRate)[0] ?? null

    return {
      participantCount,
      averageScore,
      topStudent,
      riskQuestion,
      strongestQuestion,
      weakConcepts: latestPublishedDashboard.weakConceptTags.slice(0, 3),
    }
  }, [latestPublishedDashboard])
  const getLatestDashboardQuestionNumber = (questionId?: string | null) => {
    if (!latestPublishedDashboard || !questionId) return null
    const index = latestPublishedDashboard.questionAccuracy.findIndex((item) => item.questionId === questionId)
    return index >= 0 ? index + 1 : null
  }

  useEffect(() => {
    if (!token || !latestPublishedQuestionSet) {
      setLatestPublishedDashboard(null)
      setLatestPublishedDashboardLoading(false)
      return
    }

    const loadLatestPublishedDashboard = async () => {
      try {
        setLatestPublishedDashboardLoading(true)
        const data = await getTeacherDashboard(latestPublishedQuestionSet.questionSetId, token)
        setLatestPublishedDashboard(data)
      } catch (err) {
        console.error('최근 배포 세트 대시보드 조회 실패:', err)
        setLatestPublishedDashboard(null)
      } finally {
        setLatestPublishedDashboardLoading(false)
      }
    }

    loadLatestPublishedDashboard()
  }, [latestPublishedQuestionSet, token])

  const rightPanelHandle = (
    <button
      type="button"
      className="workspace-tool-button workspace-edge-handle workspace-edge-handle--right workspace-edge-handle--floating"
      onClick={() => toggleRightPanel(!rightPanelOpen)}
      aria-label={rightPanelOpen ? '보조 패널 닫기' : '보조 패널 열기'}
      title={rightPanelOpen ? '보조 패널 닫기' : '보조 패널 열기'}
      data-testid="right-panel-toggle"
    >
      <span className="material-symbols-outlined">{rightPanelOpen ? 'right_panel_close' : 'right_panel_open'}</span>
    </button>
  )

  const handleCreateChannel = async () => {
    if (!token || !newChannelName.trim()) return
    try {
      setCreateError(null)
      const created = await createChannel({ name: newChannelName.trim(), description: '', sortOrder: channels.length + 1 }, token)
      setChannels((prev) => [...prev, created])
      setNewChannelName('')
      setCreateModalOpen(false)
    } catch {
      setCreateError('채널 생성에 실패했습니다.')
    }
  }

  const handleRenameChannel = async () => {
    if (!token || !workspace || !channelNameDraft.trim()) return
    try {
      const updated = await updateChannel(
        workspace.channel.channelId,
        {
          name: channelNameDraft.trim(),
          description: workspace.channel.description ?? '',
          sortOrder: workspace.channel.sortOrder,
          active: workspace.channel.active,
        },
        token,
      )
      setWorkspace((prev) => (prev ? { ...prev, channel: updated } : prev))
      setChannels((prev) => prev.map((item) => (item.channelId === updated.channelId ? updated : item)))
      setChannelNameDraft(updated.name)
    } catch (err) {
      console.error('채널 이름 수정 실패:', err)
    }
  }

  const handleUpload = async () => {
    if (!token || !channelId || !uploadFile || !uploadTitle.trim()) return
    try {
      setUploadError(null)
      const uploaded = await uploadMaterial(
        uploadFile,
        { channelId, title: uploadTitle.trim(), description: uploadDescription },
        token,
      )
      setWorkspace((prev) => (prev ? { ...prev, materials: [uploaded, ...prev.materials] } : prev))
      setSelectedMaterialId(uploaded.materialId)
      setUploadTitle('')
      setUploadDescription('')
      setUploadFile(null)
      setUploadModalOpen(false)
    } catch {
      setUploadError('업로드에 실패했습니다.')
    }
  }

  const toOptionsTuple = (options: string[]): [string, string, string, string] => [
    options[0] ?? '',
    options[1] ?? '',
    options[2] ?? '',
    options[3] ?? '',
  ]

  const toConceptTagsTuple = (conceptTags: string[]): [string] | [string, string] => {
    const tags = conceptTags.map((item) => item.trim()).filter(Boolean).slice(0, 2)
    if (tags.length >= 2) return [tags[0], tags[1]]
    return [tags[0] ?? '핵심개념']
  }

  const handleGenerateInChannel = async () => {
    if (!token || !channelId || !selectedMaterial) return
    try {
      setGenerating(true)
      setReviewError(null)
      const generated = await generateQuestionsInChannel(
        channelId,
        {
          questionCount,
          difficulty,
          materialId: selectedMaterial.materialId,
        },
        token,
      )
      setQuestionSets((prev) => [generated, ...prev.filter((item) => item.questionSetId !== generated.questionSetId)])
      setReviewQuestionSet(generated)
      setPublishCode(null)
      setReviewDueAt('')
      setGenerateModalOpen(false)
      setReviewModalOpen(true)
    } catch (err) {
      console.error('채널 문제 생성 실패:', err)
      setReviewError('문제 생성에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setGenerating(false)
    }
  }

  const openReviewModal = async (questionSetId: string) => {
    if (!token) return
    try {
      setReviewError(null)
      const latest = await getQuestionSetById(questionSetId, token)
      setReviewQuestionSet(latest)
      setPublishCode(latest.distributionCode)
      setReviewModalOpen(true)
    } catch (err) {
      console.error('문제 세트 조회 실패:', err)
      setReviewError('검토할 문제 세트를 불러오지 못했습니다.')
    }
  }

  const handleToggleExcluded = async (questionId: string, excluded: boolean) => {
    if (!token || !reviewQuestionSet) return
    const question = reviewQuestionSet.questions.find((item) => item.id === questionId)
    if (!question) return

    const payload: UpdateQuestionRequest = {
      stem: question.stem,
      options: toOptionsTuple(question.options),
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      conceptTags: toConceptTagsTuple(question.conceptTags),
      excluded,
    }

    try {
      setReviewSavingQuestionId(questionId)
      setReviewError(null)
      const updated = await updateQuestion(reviewQuestionSet.questionSetId, questionId, payload, token)
      setReviewQuestionSet(updated)
      setQuestionSets((prev) => prev.map((item) => (item.questionSetId === updated.questionSetId ? updated : item)))
    } catch (err) {
      console.error('문항 제외 상태 저장 실패:', err)
      setReviewError('문항 상태 저장에 실패했습니다.')
    } finally {
      setReviewSavingQuestionId(null)
    }
  }

  const handlePublishFromReview = async () => {
    if (!token || !reviewQuestionSet) return
    try {
      setPublishing(true)
      setReviewError(null)
      const normalizedDueAt = reviewDueAt ? `${reviewDueAt}:00` : undefined
      const published = await publishQuestionSet(
        reviewQuestionSet.questionSetId,
        token,
        normalizedDueAt ? { dueAt: normalizedDueAt } : undefined,
      )
      setReviewQuestionSet(published)
      setPublishCode(published.distributionCode)
      setQuestionSets((prev) => prev.map((item) => (item.questionSetId === published.questionSetId ? published : item)))
    } catch (err) {
      console.error('문제 세트 배포 실패:', err)
      setReviewError('배포에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="workspace-page teacher-workspace-page channel-workspace-page" aria-busy="true">
        <div className={`channel-shell teacher-channel-shell ${!leftSidebarOpen ? 'left-sidebar-collapsed' : ''} ${leftPanelMode === 'overlay' ? 'left-sidebar-overlay-mode' : ''}`}>
          <aside className={`channel-sidebar-panel is-open ${leftPanelMode === 'overlay' ? 'channel-sidebar-panel-overlay' : ''}`}>
            <div className="channel-sidebar-header">
              <div className="workspace-loading-copy" style={{ minWidth: 0 }}>
                <div className="workspace-loading-chip" style={{ width: '5rem' }} />
                <div className="workspace-loading-line" style={{ width: '70%' }} />
                <div className="workspace-loading-line" style={{ width: '88%', height: '0.8rem' }} />
              </div>
              <div className="workspace-loading-button" style={{ width: '2.75rem', height: '2.75rem' }} />
            </div>
            <div className="channel-sidebar-list">
              {[
                { key: 'channel-loading-item-1', width: '60%' },
                { key: 'channel-loading-item-2', width: '72%' },
                { key: 'channel-loading-item-3', width: '72%' },
                { key: 'channel-loading-item-4', width: '72%' },
              ].map((item) => (
                <div key={item.key} className="workspace-loading-row" style={{ padding: '0.875rem 0.9375rem' }}>
                  <div className="workspace-loading-line" style={{ width: item.width }} />
                  <div className="workspace-loading-line" style={{ width: '84%', height: '0.8rem' }} />
                </div>
              ))}
            </div>
          </aside>

          <div className="channel-content-shell teacher-channel-content-shell">
        <div className="workspace-header">
          <div className="workspace-header-content workspace-loading-copy">
            <div className="workspace-loading-chip" style={{ width: '7rem' }} />
            <div className="workspace-loading-line" style={{ width: '18rem', maxWidth: '70%' }} />
            <div className="workspace-loading-line" style={{ width: '24rem', maxWidth: '92%', height: '0.8rem' }} />
          </div>
          <div className="workspace-actions teacher-shell-actions">
            <div className="workspace-loading-button" style={{ width: '8.5rem', height: '2.75rem' }} />
            <div className="workspace-loading-button" style={{ width: '8rem', height: '2.75rem' }} />
          </div>
        </div>

        {rightPanelHandle}

        <div className={`workspace-layout teacher-workspace-layout ${!rightPanelOpen ? 'sidebar-collapsed' : ''} ${rightPanelMode === 'overlay' ? 'teacher-workspace-layout--overlay' : ''}`}>
              <section className="workspace-main teacher-main-stage">
                <div className="workspace-main-header">
                  <div className="workspace-main-title workspace-loading-copy">
                    <div className="workspace-loading-line" style={{ width: '10rem' }} />
                    <div className="workspace-loading-line" style={{ width: '18rem', maxWidth: '85%' }} />
                    <div className="workspace-loading-line" style={{ width: '26rem', maxWidth: '100%', height: '0.8rem' }} />
                  </div>
                </div>

                <Card className="workspace-card teacher-channel-primary-card">
                  <CardBody>
                    <div className="workspace-panel-inline-header">
                      <div className="workspace-loading-copy">
                        <div className="workspace-loading-chip" style={{ width: '8rem' }} />
                        <div className="workspace-loading-line" style={{ width: '14rem' }} />
                      </div>
                      <div className="workspace-loading-button" style={{ width: '7.5rem', height: '2.5rem' }} />
                    </div>
                    <div className="workspace-loading-line" style={{ width: '100%', maxWidth: '32rem', height: '0.8rem' }} />
                    <div className="workspace-loading-line" style={{ width: '88%', maxWidth: '28rem', height: '0.8rem', marginTop: '0.5rem' }} />
                  </CardBody>
                </Card>

                <div className="workspace-loading-document">
                  <div className="workspace-loading-toolbar">
                    <div className="workspace-loading-toolbar-copy">
                      <div className="workspace-loading-line" style={{ width: '9rem' }} />
                      <div className="workspace-loading-line" style={{ width: '15rem', height: '0.8rem' }} />
                    </div>
                    <div className="workspace-loading-button" style={{ width: '7rem', height: '2.6rem' }} />
                  </div>
                  <div className="workspace-loading-frame" />
                </div>
              </section>

              {rightPanelOpen && (
                <>
                  {rightPanelMode === 'overlay' && <div className="right-panel-backdrop is-visible" aria-hidden="true" data-testid="right-panel-backdrop" />}
                <aside className={`workspace-side teacher-channel-aux-panel ${rightPanelMode === 'overlay' ? 'teacher-channel-aux-panel--overlay' : ''}`} data-testid="right-panel">
                  <div className="workspace-loading-sidebar">
                    {[
                      { key: 'teacher-panel-loading-1', chipWidth: '6rem', blockHeight: '4.5rem' },
                      { key: 'teacher-panel-loading-2', chipWidth: '7rem', blockHeight: '5.5rem' },
                      { key: 'teacher-panel-loading-3', chipWidth: '7rem', blockHeight: '4.5rem' },
                    ].map((item) => (
                      <div key={item.key} className="workspace-loading-row">
                        <div className="workspace-loading-chip" style={{ width: item.chipWidth }} />
                        <div className="workspace-loading-line" style={{ width: '72%' }} />
                        <div className="workspace-loading-line" style={{ width: '92%', height: '0.8rem' }} />
                        <div className="workspace-loading-block" style={{ height: item.blockHeight }} />
                      </div>
                    ))}
                  </div>
                </aside>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (error) return <div className="error-container"><p>{error}</p></div>
  if (!workspace || !token || !channelId) return <div className="error-container"><p>채널 운영 화면을 찾을 수 없습니다.</p></div>

  const studentNames = workspace.participants
    .filter((item: ChannelParticipantResponse) => item.role === 'STUDENT')
    .map((item) => item.displayName)
    .join(', ')

  return (
    <div className="workspace-page teacher-workspace-page channel-workspace-page">
      <div className={`channel-shell teacher-channel-shell ${!leftSidebarOpen ? 'left-sidebar-collapsed' : ''} ${leftPanelMode === 'overlay' ? 'left-sidebar-overlay-mode' : ''}`}>
        <ChannelSidebar
          channels={channels}
          activeChannelId={channelId}
          basePath="teacher"
          description="채널을 전환하고 현재 채널 운영 흐름은 오른쪽 패널에서 이어갑니다."
          isOpen={leftSidebarOpen}
          onOpenChange={toggleLeftSidebar}
        />

        <div className="channel-content-shell teacher-channel-content-shell">
        <div className="workspace-header">
          <div className="workspace-header-content">
            <div className="workspace-section-meta">교사 · 채널 운영</div>
            <h1 className="page-title">{workspace.channel.name}</h1>
            <p className="page-description">현재 입장 학생: {studentNames || '없음'}</p>
          </div>
          <div className="workspace-actions teacher-shell-actions" />
      </div>

      {rightPanelHandle}

          <div className={`workspace-layout teacher-workspace-layout ${!rightPanelOpen ? 'sidebar-collapsed' : ''} ${rightPanelMode === 'overlay' ? 'teacher-workspace-layout--overlay' : ''}`} data-testid="workspace-layout">
            <section className="workspace-main teacher-main-stage" data-testid="pdf-viewer-area">
              <div className="workspace-main-header">
                <div className="workspace-main-title">
                  <div>{selectedMaterial?.title ?? '채널 PDF 없음'}</div>
                  <p className="workspace-side-description">
                    학생과 함께 보는 PDF를 중앙에 두고, 문제 생성·검토는 오른쪽 채널 도구에서 이어집니다.
                  </p>
                </div>
              </div>

              {selectedMaterial ? (
                <MaterialDocumentViewer materialId={selectedMaterial.materialId} token={token} />
              ) : (
                <div className="workspace-document-placeholder"><p>이 채널에 연결된 PDF가 없습니다.</p></div>
              )}

              <Card className="workspace-card teacher-channel-primary-card">
                <CardBody>
                  <div className="workspace-panel-inline-header">
                    <div>
                      <div className="workspace-main-eyebrow">채널 문서 흐름</div>
                      <h3 className="workspace-card-title">{selectedMaterial?.title ?? 'PDF를 업로드해 채널 흐름을 시작하세요'}</h3>
                    </div>
                    {latestPublishedQuestionSet ? (
                      <Link to={`/teacher/question-sets/${latestPublishedQuestionSet.questionSetId}/dashboard`}>
                        <Button size="sm">학생 결과 보기</Button>
                      </Link>
                    ) : latestReviewRequiredQuestionSet ? (
                      <Button size="sm" onClick={() => openReviewModal(latestReviewRequiredQuestionSet.questionSetId)}>검토 열기</Button>
                    ) : selectedMaterial ? (
                      <Button size="sm" onClick={() => setGenerateModalOpen(true)}>문제 생성</Button>
                    ) : (
                      <Button size="sm" onClick={() => setUploadModalOpen(true)}>PDF 업로드</Button>
                    )}
                  </div>
                  <p className="workspace-side-description">
                    {latestPublishedQuestionSet
                      ? '최근 배포 세트의 학생 결과를 확인하거나, 문서를 기준으로 다음 문제 흐름을 이어갈 수 있습니다.'
                      : latestReviewRequiredQuestionSet
                      ? '최신 생성 세트의 검토/배포 상태를 먼저 확인한 뒤 문서와 함께 마무리하세요.'
                      : selectedMaterial
                        ? `선택한 자료 #${selectedMaterial.docNo} 기준으로 문제 생성과 리뷰 흐름을 바로 이어갈 수 있습니다.`
                        : '먼저 PDF를 채널에 올리면 학생과 함께 보는 문서 중심 흐름을 시작할 수 있습니다.'}
                  </p>
                  {latestPublishedQuestionSet && latestPublishedDashboardSummary && (
                    <div className="teacher-dashboard-inline-strip">
                      <div className="teacher-dashboard-inline-item">
                        <span>제출 학생</span>
                        <strong>{latestPublishedDashboardSummary.participantCount}명</strong>
                      </div>
                      <div className="teacher-dashboard-inline-item">
                        <span>평균 점수</span>
                        <strong>{latestPublishedDashboardSummary.averageScore.toFixed(1)}점</strong>
                      </div>
                      <div className="teacher-dashboard-inline-item">
                        <span>위험 문항</span>
                        <strong>
                          {latestPublishedDashboardSummary.riskQuestion
                            ? `${getLatestDashboardQuestionNumber(latestPublishedDashboardSummary.riskQuestion.questionId) ?? '-'}번 · ${latestPublishedDashboardSummary.riskQuestion.accuracyRate.toFixed(0)}%`
                            : '없음'}
                        </strong>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </section>

            {rightPanelOpen && (
              <>
                {rightPanelMode === 'overlay' && <div className="right-panel-backdrop is-visible" aria-hidden="true" data-testid="right-panel-backdrop" />}
                <aside className={`workspace-side teacher-channel-aux-panel ${rightPanelMode === 'overlay' ? 'teacher-channel-aux-panel--overlay' : ''}`} data-testid="right-panel">
                <div className="workspace-panel-inline-header teacher-panel-header">
                  <div>
                    <div className="workspace-main-eyebrow">보조 패널</div>
                    <h3 className="workspace-card-title">채널 도구와 흐름</h3>
                  </div>
                </div>

                <div className="teacher-panel-stack teacher-assist-panel" data-testid="teacher-assist-panel">
                  <section className="channel-sidebar-section teacher-channel-settings teacher-panel-summary teacher-dashboard-preview-card">
                    <div>
                      <div className="workspace-main-eyebrow">최근 배포 세트</div>
                      <strong>학생 풀이 현황 요약</strong>
                    </div>
                    {latestPublishedDashboardLoading ? (
                      <p className="workspace-side-description">대시보드 요약을 불러오는 중입니다.</p>
                    ) : latestPublishedQuestionSet && latestPublishedDashboardSummary ? (
                      <>
                        <div className="teacher-live-metrics">
                          <div className="teacher-live-metric">
                            <span>참여 학생</span>
                            <strong>{latestPublishedDashboardSummary.participantCount}명</strong>
                          </div>
                          <div className="teacher-live-metric">
                            <span>평균 점수</span>
                            <strong>{latestPublishedDashboardSummary.averageScore.toFixed(1)}점</strong>
                          </div>
                          <div className="teacher-live-metric">
                            <span>최고 점수</span>
                            <strong>{latestPublishedDashboardSummary.topStudent ? `${latestPublishedDashboardSummary.topStudent.score}점` : '-'}</strong>
                          </div>
                          <div className="teacher-live-metric teacher-live-metric--risk">
                            <span>위험 문항</span>
                            <strong>
                              {latestPublishedDashboardSummary.riskQuestion
                                ? `${getLatestDashboardQuestionNumber(latestPublishedDashboardSummary.riskQuestion.questionId) ?? '-'}번`
                                : '-'}
                            </strong>
                          </div>
                        </div>
                        <div className="teacher-live-insights">
                          <div className="teacher-live-insight">
                            <span className="teacher-live-insight-label">상위 학생</span>
                            <strong>{latestPublishedDashboardSummary.topStudent?.studentId ?? '제출 없음'}</strong>
                          </div>
                          <div className="teacher-live-insight">
                            <span className="teacher-live-insight-label">가장 쉬운 문항</span>
                            <strong>
                              {latestPublishedDashboardSummary.strongestQuestion
                                ? `${getLatestDashboardQuestionNumber(latestPublishedDashboardSummary.strongestQuestion.questionId) ?? '-'}번 · ${latestPublishedDashboardSummary.strongestQuestion.accuracyRate.toFixed(0)}%`
                                : '데이터 없음'}
                            </strong>
                          </div>
                          <div className="teacher-live-insight">
                            <span className="teacher-live-insight-label">취약 개념</span>
                            <strong>
                              {latestPublishedDashboardSummary.weakConcepts.length > 0
                                ? latestPublishedDashboardSummary.weakConcepts.map((item) => `${item.tag}(${item.count})`).join(', ')
                                : '아직 없음'}
                            </strong>
                          </div>
                        </div>
                        <div className="workspace-sidebar-actions">
                          <Link to={`/teacher/question-sets/${latestPublishedQuestionSet.questionSetId}/dashboard`}>
                            <Button size="sm">전체 대시보드 보기</Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="student-channel-task-empty">
                        최근 배포 세트가 없거나 아직 학생 제출이 없습니다. 배포 후 학생이 제출하면 여기에 요약이 나타납니다.
                      </div>
                    )}
                  </section>

                  <section className="channel-sidebar-section teacher-channel-settings teacher-panel-summary">
                    <div>
                      <div className="workspace-main-eyebrow">현재 작업 순서</div>
                      <strong>1. 문서 선택 → 2. 문제 생성 → 3. 채널 대화 확인</strong>
                    </div>
                    <p className="workspace-side-description">
                      지금 선택한 PDF를 바꾸고, 바로 문제를 만들고, 최근 대화와 배포 상태를 이어서 확인하세요.
                    </p>
                    <div className="workspace-sidebar-actions teacher-panel-quick-actions">
                      <Button
                        onClick={() => { setGenerateModalOpen(true); setReviewError(null) }}
                        data-testid="ask-ai-action"
                      >
                        문제 생성
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('teacher-channel-chat-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        data-testid="channel-chat-action"
                      >
                        채널 대화 보기
                      </Button>
                    </div>
                  </section>

                  <section className="channel-sidebar-section" data-testid="document-select">
                    <div>
                      <div className="workspace-main-eyebrow">문서 전환</div>
                      <strong>{selectedMaterial?.title ?? '채널 PDF 없음'}</strong>
                    </div>
                    <p className="workspace-side-description">
                      문서를 바꾸면 문제 생성과 배포 흐름이 바로 새 자료 기준으로 이어집니다.
                    </p>
                    <div className="workspace-questions-list teacher-material-list">
                      {workspace.materials.map((material) => (
                        <button
                          key={material.materialId}
                          type="button"
                          className={`workspace-option ${selectedMaterial?.materialId === material.materialId ? 'selected' : ''}`}
                          onClick={() => setSelectedMaterialId(material.materialId)}
                        >
                          <span>#{material.docNo}</span>
                          <span>{material.title}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="channel-sidebar-section">
                    <div>
                      <div className="workspace-main-eyebrow">채널 관리</div>
                      <strong>현재 채널 설정</strong>
                    </div>
                    <div className="workspace-inline-form">
                      <Input
                        label="채널 이름"
                        value={channelNameDraft}
                        onChange={(e) => setChannelNameDraft(e.target.value)}
                        placeholder="현재 채널 이름"
                      />
                      <Button variant="outline" onClick={handleRenameChannel} disabled={!channelNameDraft.trim()}>
                        저장
                      </Button>
                    </div>
                    <div className="workspace-sidebar-actions">
                      <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.5rem' }}>add</span>
                        새 채널 생성
                      </Button>
                    </div>
                  </section>

                  <section className="channel-sidebar-section" id="teacher-channel-chat-section">
                    <div>
                      <div className="workspace-main-eyebrow">채널 대화</div>
                      <strong>최근 메시지</strong>
                    </div>
                    <p className="workspace-side-description">최근 대화만 빠르게 보고, 필요한 경우 위의 문제 생성 흐름으로 바로 전환하세요.</p>
                    <div className="teacher-channel-message-list">
                      {recentTeacherMessages.length === 0 ? (
                        <div className="student-channel-task-empty">아직 메시지가 없습니다.</div>
                      ) : (
                        recentTeacherMessages.map((item) => (
                          <div key={item.messageId} className="student-message-item teacher-channel-message-item">
                            <strong>{item.displayName}</strong>
                            <span>{item.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="channel-sidebar-section">
                    <div>
                      <div className="workspace-main-eyebrow">배포 상태</div>
                      <strong>문제 흐름</strong>
                    </div>
                    <div className="workspace-sidebar-actions">
                      <Button onClick={() => { setGenerateModalOpen(true); setReviewError(null) }}>문제 생성</Button>
                      <Button
                        variant="outline"
                        disabled={!latestReviewRequiredQuestionSet}
                        onClick={() => latestReviewRequiredQuestionSet && openReviewModal(latestReviewRequiredQuestionSet.questionSetId)}
                      >
                        최근 검토 열기
                      </Button>
                    </div>
                    {latestReviewRequiredQuestionSet ? (
                      <div className="teacher-channel-task-card review-required-card">
                        <div>
                          <div className="workspace-main-eyebrow">검토 필요</div>
                          <strong className="student-channel-task-title">최근 생성 세트 검토 필요</strong>
                          <p className="student-channel-task-description">
                            현재 PDF 기준으로 생성된 최신 세트의 검토와 배포 상태만 보여줍니다.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => openReviewModal(latestReviewRequiredQuestionSet.questionSetId)}>검토 모달 열기</Button>
                      </div>
                    ) : latestQuestionSet ? (
                      <div className="student-channel-task-empty">최근 생성 세트는 이미 검토가 끝났거나, 아직 새로 생성된 세트가 없습니다.</div>
                    ) : null}
                    {latestPublishedQuestionSet ? (
                      <div className="teacher-channel-task-card">
                        <div>
                          <div className="workspace-main-eyebrow">배포 완료</div>
                          <strong className="student-channel-task-title">최근 배포 코드</strong>
                          <p className="student-channel-task-description">
                            배포 코드 <strong>{latestPublishedQuestionSet.distributionCode}</strong> · 학생 입장용 코드만 간단히 확인하세요.
                          </p>
                        </div>
                        <div className="workspace-sidebar-actions">
                          <Button variant="outline" size="sm" onClick={() => openReviewModal(latestPublishedQuestionSet.questionSetId)}>배포 세트 보기</Button>
                          <Link to={`/teacher/question-sets/${latestPublishedQuestionSet.questionSetId}/dashboard`}>
                            <Button size="sm">학생 결과 보기</Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="student-channel-task-empty">이 PDF에서 아직 배포된 문제 세트가 없습니다.</div>
                    )}
                  </section>
                </div>
                </aside>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setCreateError(null); setNewChannelName('') }}
        title="새 채널 생성"
        size="md"
      >
        <div className="modal-form">
          {createError && <div className="modal-error">{createError}</div>}
          <Input
            label="채널 이름"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="새 채널 이름을 입력하세요"
          />
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => { setCreateModalOpen(false); setCreateError(null); setNewChannelName('') }}>취소</Button>
          <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>생성</Button>
        </div>
      </Modal>

      <Modal
        isOpen={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setUploadError(null); setUploadTitle(''); setUploadDescription(''); setUploadFile(null) }}
        title="PDF 업로드"
        size="md"
      >
        <div className="modal-form">
          {uploadError && <div className="modal-error">{uploadError}</div>}
          <Input
            label="자료 제목"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="자료 제목을 입력하세요"
          />
          <div className="form-group">
            <label className="input-label" htmlFor="upload-description">설명</label>
            <textarea id="upload-description" className="textarea" rows={3} value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="자료에 대한 설명을 입력하세요" />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="pdf-upload">PDF 파일</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="file-input"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="file-input-label">
                <span className="material-symbols-outlined">upload_file</span>
                <span>{uploadFile ? uploadFile.name : 'PDF 파일 선택'}</span>
              </label>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => { setUploadModalOpen(false); setUploadError(null); setUploadTitle(''); setUploadDescription(''); setUploadFile(null) }}>취소</Button>
          <Button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim()}>업로드</Button>
        </div>
      </Modal>

      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="문제 생성"
        size="md"
      >
        <div className="modal-form">
          <div className="workspace-side-description">
            현재 채널 <strong>{workspace.channel.name}</strong> / 자료 <strong>{selectedMaterial?.title ?? '없음'}</strong> 기준으로 생성합니다.
          </div>
          {generating && (
            <div className="teacher-generate-loading-card">
              <div className="workspace-main-eyebrow">생성 중</div>
              <strong>AI가 문제를 만드는 중입니다</strong>
              <p>문항과 해설을 준비하고 있습니다. 완료되면 바로 검토 화면으로 이동합니다.</p>
            </div>
          )}
          <div className="form-group">
            <label className="input-label" htmlFor="channel-question-count">문항 수</label>
            <input
              id="channel-question-count"
              className="number-input"
              type="number"
              min={1}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="channel-question-difficulty">난이도</label>
            <select id="channel-question-difficulty" className="number-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}>
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setGenerateModalOpen(false)} disabled={generating}>취소</Button>
          <Button onClick={handleGenerateInChannel} loading={generating} disabled={!selectedMaterial}>생성 후 검토</Button>
        </div>
      </Modal>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false)
          setPublishCode(null)
          setReviewError(null)
          setReviewDueAt('')
        }}
        title="문제 검토 및 배포"
        size="xl"
      >
        <div className="modal-form">
          {reviewError && <div className="modal-error">{reviewError}</div>}
          {!reviewQuestionSet ? (
            <p className="workspace-side-description">검토할 문제 세트를 선택하세요.</p>
          ) : (
            <>
              <div className="workspace-side-description">
                상태: <strong>{reviewQuestionSet.status === 'REVIEW_REQUIRED' ? '검토 필요' : reviewQuestionSet.status === 'PUBLISHED' ? '배포 완료' : reviewQuestionSet.status === 'CLOSED' ? '종료' : reviewQuestionSet.status}</strong> · 총 {reviewQuestionSet.questions.length}문항
              </div>
              <div className="workspace-questions-list" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {reviewQuestionSet.questions.map((question, index) => (
                  <div key={question.id} className="teacher-channel-task-card">
                    <div>
                      <div className="workspace-main-eyebrow">문제 {index + 1}</div>
                      <strong>{question.stem}</strong>
                      <p className="workspace-side-description" style={{ marginTop: '0.5rem' }}>
                        {question.options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join(' · ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={question.excluded ? 'outline' : 'secondary'}
                      loading={reviewSavingQuestionId === question.id}
                      onClick={() => handleToggleExcluded(question.id, !question.excluded)}
                    >
                      {question.excluded ? '제외 해제' : '문항 제외'}
                    </Button>
                  </div>
                ))}
              </div>

              {publishCode ? (
                <div className="teacher-channel-task-card">
                  <div>
                    <div className="workspace-main-eyebrow">배포 완료</div>
                    <strong>배포 코드: {publishCode}</strong>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="input-label" htmlFor="review-due-at">마감 일시 (선택)</label>
                  <input
                    id="review-due-at"
                    className="number-input"
                    type="datetime-local"
                    value={reviewDueAt}
                    onChange={(e) => setReviewDueAt(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <Button
            variant="outline"
            onClick={() => {
              setReviewModalOpen(false)
              setPublishCode(null)
              setReviewError(null)
              setReviewDueAt('')
            }}
          >
            닫기
          </Button>
          {!publishCode && (
            <Button
              onClick={handlePublishFromReview}
              loading={publishing}
              disabled={!reviewQuestionSet || reviewQuestionSet.questions.every((question) => question.excluded)}
            >
              최종 확인 후 즉시 배포
            </Button>
          )}
        </div>
      </Modal>
    </div>
  )
}
