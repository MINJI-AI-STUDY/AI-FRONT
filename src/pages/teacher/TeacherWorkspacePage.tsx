/**
 * 교사 공통 자료 워크스페이스
 * 같은 PDF를 중심으로 생성/검토/JSON 결과를 함께 봅니다.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer, Modal } from '../../components'
import { generateQuestions, getMaterial } from '../../api/teacher'
import type { GenerateQuestionsRequest, MaterialSummaryResponse, QuestionSetResponse } from '../../api/teacher'
import '../WorkspacePages.css'
import './TeacherPages.css'

export function TeacherWorkspacePage() {
  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [material, setMaterial] = useState<MaterialSummaryResponse | null>(null)
  const [questionSet, setQuestionSet] = useState<QuestionSetResponse | null>(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  useEffect(() => {
    if (!materialId || !token) return

    const fetchMaterial = async () => {
      try {
        const data = await getMaterial(materialId, token)
        setMaterial(data)
      } catch (err) {
        console.error('자료 조회 실패:', err)
        setError('자료를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()
  }, [materialId, token])

  const generatedJson = useMemo(() => {
    if (!questionSet) return null
    return JSON.stringify(questionSet, null, 2)
  }, [questionSet])

  const handleGenerate = async () => {
    if (!materialId || !token) return
    setGenerating(true)
    setError(null)
    try {
      const payload: GenerateQuestionsRequest = { questionCount, difficulty }
      const result = await generateQuestions(materialId, payload, token)
      setQuestionSet(result)
    } catch (err) {
      console.error('문제 생성 실패:', err)
      setError('문제 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  }

  if (!material || !token || !materialId) {
    return <div className="error-container"><p>{error ?? '자료를 찾을 수 없습니다.'}</p></div>
  }

  return (
    <div className="workspace-page teacher-workspace-page">
      <div className="workspace-header">
        <div className="workspace-header-content">
          <div className="workspace-section-meta">교사 · 문서 뷰어 및 문제 출제</div>
          <h1 className="page-title">{material.title}</h1>
          <p className="page-description">같은 자료를 보면서 문제를 생성·검토·배포합니다.</p>
        </div>
        <div className="workspace-actions teacher-shell-actions">
          <Button variant="outline" size="sm" className="workspace-edge-handle workspace-edge-handle--right" onClick={() => setRightPanelOpen((current) => !current)}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.35rem' }}>
              {rightPanelOpen ? 'right_panel_close' : 'right_panel_open'}
            </span>
            {rightPanelOpen ? '보조 패널 닫기' : '보조 패널 열기'}
          </Button>
          <Link to="/teacher"><Button variant="outline">교사 홈</Button></Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className={`workspace-layout teacher-workspace-layout ${!rightPanelOpen ? 'sidebar-collapsed' : ''}`}>
        <section className="workspace-main">
          <div className="workspace-main-header">
            <div className="workspace-main-title">
              <div className="workspace-main-title-icon">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <div className="workspace-main-eyebrow">학습 자료</div>
                <div>{material.title}</div>
              </div>
            </div>
            <div className="workspace-main-toolbar">
              <button className="workspace-tool-button" type="button" aria-label="search">
                <span className="material-symbols-outlined">search</span>
              </button>
              <button className="workspace-tool-button" type="button" aria-label="print">
                <span className="material-symbols-outlined">print</span>
              </button>
            </div>
          </div>

          <Card className="workspace-card teacher-workspace-primary-card">
            <CardBody>
              <div className="workspace-panel-inline-header">
                <div>
                  <div className="workspace-main-eyebrow">문서 중심 작업</div>
                  <h3 className="workspace-card-title">{questionSet ? '생성된 문제를 검토하고 배포하세요' : '이 자료에서 바로 문제를 생성하세요'}</h3>
                </div>
                {questionSet ? (
                  <div className="workspace-sidebar-actions">
                    <Button variant="primary" onClick={() => navigate(`/teacher/question-sets/${questionSet.questionSetId}/review`, { state: { questionSet } })}>
                      검토 화면 열기
                    </Button>
                    <Link to={`/teacher/question-sets/${questionSet.questionSetId}/dashboard`}>
                      <Button variant="outline">학생 결과 보기</Button>
                    </Link>
                  </div>
                ) : (
                  <Button variant="primary" onClick={handleGenerate} loading={generating}>
                    AI 문제 생성
                  </Button>
                )}
              </div>
              <p className="workspace-side-description">
                {questionSet
                  ? '생성 결과와 배포 상태를 먼저 확인한 뒤 문서와 나란히 검토를 이어갈 수 있습니다.'
                  : '현재 문서를 기준으로 바로 문제를 생성해보세요. 세부 설정은 우측 도구에서 조정할 수 있습니다.'}
              </p>
            </CardBody>
          </Card>

          <MaterialDocumentViewer materialId={materialId} token={token} />
        </section>

        {rightPanelOpen && (
          <aside className="workspace-side teacher-side">
            <div className="workspace-panel-inline-header teacher-panel-header">
              <div>
                <div className="workspace-main-eyebrow">보조 패널</div>
                <h3 className="workspace-card-title">문제 생성 · JSON 검토</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setRightPanelOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="teacher-panel-stack">
              <Card className="workspace-card">
                <CardBody>
                  <div className="workspace-panel-inline-header">
                    <h3 className="workspace-card-title">문제 생성 설정</h3>
                    <span className="workspace-mini-chip">AI</span>
                  </div>
                  <div className="form-group">
                    <label className="input-label">문항 수</label>
                    <input className="number-input" type="number" min={1} max={10} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="input-label">난이도</label>
                    <select className="number-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')}>
                      <option value="EASY">쉬움</option>
                      <option value="MEDIUM">보통</option>
                      <option value="HARD">어려움</option>
                    </select>
                  </div>
                  <Button loading={generating} onClick={handleGenerate}>AI 문제 생성</Button>
                </CardBody>
              </Card>

              <Card className="workspace-card workspace-json-card">
                <CardBody>
                  <div className="workspace-panel-inline-header">
                    <h3 className="workspace-card-title">생성 결과 JSON</h3>
                    {generatedJson && (
                      <Button variant="ghost" size="sm" onClick={() => setIsJsonModalOpen(true)}>
                        크게 보기
                      </Button>
                    )}
                  </div>
                {generatedJson ? <pre className="workspace-json-view">{generatedJson}</pre> : <p className="workspace-empty">문제를 생성하면 구조화된 결과가 여기에 표시됩니다.</p>}
                {questionSet && (
                  <div className="workspace-sidebar-actions" style={{ marginTop: '1rem' }}>
                    <Link to={`/teacher/question-sets/${questionSet.questionSetId}/dashboard`}>
                      <Button variant="outline">학생 결과 보기</Button>
                    </Link>
                  </div>
                )}
              </CardBody>
            </Card>
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        title="생성 결과 JSON"
        size="xl"
      >
        {generatedJson ? <pre className="workspace-json-view workspace-json-view-modal">{generatedJson}</pre> : null}
      </Modal>
    </div>
  )
}
