/**
 * 문제 생성 페이지
 * F3: 문제 생성 옵션 입력 및 생성 요청
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { generateQuestions } from '../../api/teacher'
import type { GenerateQuestionsRequest } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 문제 생성 페이지 컴포넌트
 */
export function QuestionGeneratePage() {
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { materialId } = useParams<{ materialId: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

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
        <h1 className="page-title">문제 생성</h1>
        <p className="page-description">자료를 기반으로 객관식 문제를 생성합니다.</p>
      </div>

      <Card>
        <CardBody>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="generate-form">
            <div className="form-group">
              <label className="input-label">문항 수</label>
              <input type="number" min={1} max={10} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="number-input" />
              <span className="input-helper">1~10개 사이로 입력</span>
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
