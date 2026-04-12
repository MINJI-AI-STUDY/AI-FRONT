/**
 * 문제 생성 페이지
 * F3: 문제 생성 옵션 입력 및 생성 요청
 */

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { generateQuestions, getMaterial } from '../../api/teacher'
import type { GenerateQuestionsRequest, MaterialSummaryResponse } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 문제 생성 페이지 컴포넌트
 */
export function QuestionGeneratePage() {
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [material, setMaterial] = useState<MaterialSummaryResponse | null>(null)
  const [loadingMaterial, setLoadingMaterial] = useState(true)

  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!materialId || !token) return

    const fetchMaterial = async () => {
      try {
        setLoadingMaterial(true)
        const data = await getMaterial(materialId, token)
        setMaterial(data)
      } catch (err) {
        console.error('문제 생성용 자료 조회 실패:', err)
      } finally {
        setLoadingMaterial(false)
      }
    }

    fetchMaterial()
  }, [materialId, token])

  /**
   * 생성 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!materialId || !token) {
      setError('필수 정보가 없습니다.')
      return
    }

    setLoading(true)

    try {
      const data: GenerateQuestionsRequest = { questionCount, difficulty }
      const questionSet = await generateQuestions(materialId, data, token)
      navigate(`/teacher/question-sets/${questionSet.questionSetId}/review`, { state: { questionSet } })
    } catch (err) {
      console.error('문제 생성 실패:', err)
      setError('문제 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="question-generate-page">
      <div className="page-header">
        <div className="page-breadcrumbs">
          <Link to="/teacher">교사 대시보드</Link>
          <span>/</span>
          <span>문제 생성</span>
        </div>
        <h1 className="page-title">문제 생성</h1>
        <p className="page-description">자료를 기반으로 객관식 문제를 생성합니다. 현재 어떤 자료로 문제를 만드는지 먼저 확인하고 옵션을 조절하세요.</p>
      </div>

      <Card className="material-context-card teacher-material-context-card">
        <CardBody>
          <div className="material-context-header">
            <div>
              <div className="action-meta">문제 생성 기준 자료</div>
              <h3 className="material-context-title">{material?.title ?? '자료 정보를 불러오는 중...'}</h3>
              <p className="material-context-description">{loadingMaterial ? '자료 정보를 불러오는 중입니다.' : material?.description || '설명이 등록되지 않았습니다. 이 자료 내용을 바탕으로 AI가 객관식 문제를 생성합니다.'}</p>
            </div>
            <div className="material-context-actions">
              <span className={`status-badge-mini ${material?.status ? `status-${material.status.toLowerCase()}` : 'status-processing'}`}>
                {material?.status === 'READY' ? '분석 완료' : loadingMaterial ? '불러오는 중' : material?.status ?? '자료 정보 없음'}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => navigate(-1)}>이전 화면으로</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="generate-form">
            <div className="form-group">
              <label className="input-label">문항 수</label>
              <input type="number" min={1} max={10} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="number-input" />
              <span className="input-helper">1~10개 사이로 입력하세요. 처음에는 5개 내외로 생성하면 검토가 더 편합니다.</span>
            </div>

            <div className="form-group">
              <label className="input-label">난이도</label>
              <div className="difficulty-options">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
                  <label key={level} className="difficulty-option">
                    <input type="radio" name="difficulty" value={level} checked={difficulty === level} onChange={() => setDifficulty(level)} />
                    <span className="difficulty-label">
                      {level === 'EASY' && '쉬움'}
                      {level === 'MEDIUM' && '보통'}
                      {level === 'HARD' && '어려움'}
                    </span>
                  </label>
                ))}
              </div>
              <span className="input-helper">쉬움은 핵심 개념 확인, 보통은 일반 수업 난이도, 어려움은 추론형 검토에 적합합니다.</span>
            </div>

            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
              <Button type="submit" loading={loading}>문제 생성</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
