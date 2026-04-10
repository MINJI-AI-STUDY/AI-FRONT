import { useEffect, useState } from 'react'
import { Button, Card, CardBody, Modal } from '..'
import { getSubmissionResult, type StudentResultResponse } from '../../api/student'

interface SubmissionResultModalProps {
  submissionId: string | null
  token: string
  isOpen: boolean
  onClose: () => void
}

export function SubmissionResultModal({ submissionId, token, isOpen, onClose }: SubmissionResultModalProps) {
  const [result, setResult] = useState<StudentResultResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !submissionId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setResult(await getSubmissionResult(submissionId, token))
      } catch (err) {
        console.error('결과 모달 조회 실패:', err)
        setError('결과를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, submissionId, token])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="제출 결과" size="xl">
      {loading && <div className="loading-container"><div className="loading-spinner" /><p>로딩 중...</p></div>}
      {error && <div className="error-container"><p>{error}</p></div>}
      {!loading && !error && result && (
        <div className="submission-result-page">
          <Card className="score-card">
            <CardBody>
              <div className="score-display">
                <div className="score-value">{result.score} / {result.questionResults.length}</div>
                <div className="score-label">점수</div>
              </div>
            </CardBody>
          </Card>
          <div className="results-list">
            {result.questionResults.map((question, index) => (
              <Card key={`${question.questionId}-${index}`} className={`result-card ${question.correct ? 'correct' : 'wrong'}`}>
                <CardBody>
                  <div className="result-header"><span className="result-number">문제 {index + 1}</span><span className={`result-badge ${question.correct ? 'correct' : 'wrong'}`}>{question.correct ? '정답' : '오답'}</span></div>
                  <div className="result-answer"><p><strong>선택한 답:</strong> {String.fromCharCode(65 + question.selectedOptionIndex)}</p></div>
                  <div className="result-explanation"><strong>해설:</strong> {question.explanation}</div>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="page-actions"><Button variant="outline" onClick={onClose}>닫기</Button></div>
        </div>
      )}
    </Modal>
  )
}
