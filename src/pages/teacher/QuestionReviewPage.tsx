/**
 * 문제 검토 페이지
 * F3: 생성된 문제 검토, 수정, 배포
 */

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody, Input } from '../../components'
import { getQuestionSetById, publishQuestionSet, updateQuestion } from '../../api/teacher'
import type { QuestionResponse, QuestionSetResponse, UpdateQuestionRequest } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 문제 검토 페이지 컴포넌트
 */
export function QuestionReviewPage() {
  const location = useLocation()
  const initialQuestionSet = (location.state as { questionSet?: QuestionSetResponse } | null)?.questionSet ?? null

  const [questionSet, setQuestionSet] = useState<QuestionSetResponse | null>(initialQuestionSet)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distributionCode, setDistributionCode] = useState<string | null>(null)

  const { questionSetId } = useParams<{ questionSetId: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!questionSetId || !token) {
      setLoading(false)
      return
    }

    const fetchQuestionSet = async () => {
      try {
        if (initialQuestionSet) {
          setQuestionSet(initialQuestionSet)
        }
        const latest = await getQuestionSetById(questionSetId, token)
        setQuestionSet(latest)
      } catch (err) {
        console.error('문제 세트 조회 실패:', err)
        setError('문제 세트를 가져오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionSet()
  }, [initialQuestionSet, questionSetId, token])

  const handleSaveQuestion = async (question: QuestionResponse, updateData: UpdateQuestionRequest) => {
    if (!questionSetId || !token) return
    try {
      const updatedQuestionSet = await updateQuestion(questionSetId, question.id, updateData, token)
      setQuestionSet(updatedQuestionSet)
      setError(null)
    } catch (err) {
      console.error('문제 수정 실패:', err)
      setError('문제 수정에 실패했습니다.')
    }
  }

  const handlePublish = async () => {
    if (!questionSetId || !token) return
    setPublishing(true)
    setError(null)
    try {
      const result = await publishQuestionSet(questionSetId, token)
      setQuestionSet(result)
      setDistributionCode(result.distributionCode)
    } catch (err) {
      console.error('배포 실패:', err)
      setError('배포에 실패했습니다.')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>
  if (error && !questionSet) return <div className="error-container"><p>{error}</p><Button variant="outline" onClick={() => navigate('/teacher')}>목록으로</Button></div>
  if (!questionSet) return <div className="error-container"><p>문제 세트를 찾을 수 없습니다.</p><Button variant="outline" onClick={() => navigate('/teacher')}>목록으로</Button></div>

  if (distributionCode) {
    return (
      <div className="question-review-page">
        <Card>
          <CardBody>
            <div className="publish-success">
              <h2>배포 완료</h2>
              <p>학생들에게 다음 코드를 공유하세요:</p>
              <div className="distribution-code-box"><code className="distribution-code">{distributionCode}</code></div>
              <div className="publish-actions">
                <Button variant="outline" onClick={() => navigate('/teacher')}>목록으로</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  const activeQuestions = questionSet.questions.filter((q) => !q.excluded)

  return (
    <div className="question-review-page">
      <div className="page-header">
        <h1 className="page-title">문제 검토</h1>
        <p className="page-description">생성된 문제를 검토하고 수정한 후 배포합니다.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="questions-list">
        {questionSet.questions.map((question, index) => (
          <EditableQuestionCard key={question.id} question={question} index={index + 1} onSave={handleSaveQuestion} />
        ))}
      </div>

      <Card className="publish-card">
        <CardBody>
          <div className="publish-info"><p>총 <strong>{questionSet.questions.length}</strong>개 문제 중 <strong>{activeQuestions.length}</strong>개가 배포됩니다.</p></div>
          <div className="publish-actions">
            <Button variant="outline" onClick={() => navigate('/teacher')}>취소</Button>
            <Button variant="primary" loading={publishing} onClick={handlePublish} disabled={activeQuestions.length === 0}>배포</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

interface EditableQuestionCardProps {
  question: QuestionResponse
  index: number
  onSave: (question: QuestionResponse, updateData: UpdateQuestionRequest) => Promise<void>
}

function EditableQuestionCard({ question, index, onSave }: EditableQuestionCardProps) {
  const [stem, setStem] = useState(question.stem)
  const [options, setOptions] = useState<[string, string, string, string]>([question.options[0] ?? '', question.options[1] ?? '', question.options[2] ?? '', question.options[3] ?? ''])
  const [correctOptionIndex, setCorrectOptionIndex] = useState(question.correctOptionIndex)
  const [explanation, setExplanation] = useState(question.explanation)
  const [conceptTagsInput, setConceptTagsInput] = useState(question.conceptTags.join(', '))
  const [excluded, setExcluded] = useState(question.excluded)
  const [saving, setSaving] = useState(false)

  const handleOptionChange = (optionIndex: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextOptions = [...options] as [string, string, string, string]
    nextOptions[optionIndex] = event.target.value
    setOptions(nextOptions)
  }

  const handleSave = async () => {
    const parsedTags = conceptTagsInput.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 2)
    const updateData: UpdateQuestionRequest = {
      stem: stem.trim(),
      options,
      correctOptionIndex,
      explanation: explanation.trim(),
      conceptTags: (parsedTags.length === 2 ? [parsedTags[0], parsedTags[1]] : [parsedTags[0] ?? '핵심개념']) as [string] | [string, string],
      excluded,
    }
    setSaving(true)
    try {
      await onSave(question, updateData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className={`question-card ${excluded ? 'excluded' : ''}`}>
      <CardBody>
        <div className="question-header">
          <span className="question-number">문제 {index}</span>
          <label className="exclude-toggle"><input type="checkbox" checked={excluded} onChange={(event) => setExcluded(event.target.checked)} /><span>제외</span></label>
        </div>
        <Input label="문항" type="text" value={stem} onChange={(event) => setStem(event.target.value)} />
        <div className="question-options-edit">
          {options.map((option, optionIndex) => (
            <Input key={`${question.id}-${optionIndex}`} label={`보기 ${String.fromCharCode(65 + optionIndex)}`} type="text" value={option} onChange={(event) => handleOptionChange(optionIndex, event)} />
          ))}
        </div>
        <div className="form-group">
          <label className="input-label">정답 인덱스</label>
          <select className="number-input" value={correctOptionIndex} onChange={(event) => setCorrectOptionIndex(Number(event.target.value))}>
            <option value={0}>A</option><option value={1}>B</option><option value={2}>C</option><option value={3}>D</option>
          </select>
        </div>
        <div className="form-group">
          <label className="input-label">해설</label>
          <textarea className="textarea" value={explanation} onChange={(event) => setExplanation(event.target.value)} rows={3} />
        </div>
        <Input label="개념 태그 (쉼표로 최대 2개)" type="text" value={conceptTagsInput} onChange={(event) => setConceptTagsInput(event.target.value)} />
        <div className="publish-actions"><Button variant="secondary" loading={saving} onClick={handleSave}>수정 저장</Button></div>
      </CardBody>
    </Card>
  )
}
