/**
 * 교사 공통 자료 워크스페이스
 * 같은 PDF를 중심으로 생성/검토/JSON 결과를 함께 봅니다.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, MaterialDocumentViewer } from '../../components'
import { generateQuestions, getMaterial } from '../../api/teacher'
import type { GenerateQuestionsRequest, MaterialSummaryResponse, QuestionSetResponse } from '../../api/teacher'
import '../WorkspacePages.css'

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
        <div>
          <h1 className="page-title">{material.title}</h1>
          <p className="page-description">같은 자료를 보면서 문제를 생성·검토·배포합니다.</p>
        </div>
        <div className="workspace-actions">
          {questionSet && (
            <Button variant="primary" onClick={() => navigate(`/teacher/question-sets/${questionSet.questionSetId}/review`, { state: { questionSet } })}>
              검토 화면 열기
            </Button>
          )}
          <Link to="/teacher"><Button variant="outline">교사 홈</Button></Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="workspace-layout">
        <section className="workspace-main">
          <MaterialDocumentViewer materialId={materialId} token={token} />
        </section>

        <aside className="workspace-side teacher-side">
          <Card className="workspace-card">
            <CardBody>
              <h3 className="workspace-card-title">문제 생성 설정</h3>
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
              <h3 className="workspace-card-title">생성 결과 JSON</h3>
              {generatedJson ? <pre className="workspace-json-view">{generatedJson}</pre> : <p className="workspace-empty">문제를 생성하면 구조화된 결과가 여기에 표시됩니다.</p>}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  )
}
