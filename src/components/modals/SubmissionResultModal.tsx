import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardBody, Modal } from '..'
import { getSubmissionResult, type StudentResultResponse } from '../../api/student'

interface SubmissionResultModalProps {
  submissionId: string | null
  token: string
  isOpen: boolean
  onClose: () => void
}

function getSelectedOptionLabel(selectedOptionIndex: number | null | undefined) {
  return typeof selectedOptionIndex === 'number' && Number.isInteger(selectedOptionIndex) && selectedOptionIndex >= 0
    ? String.fromCharCode(65 + selectedOptionIndex)
    : '알 수 없음'
}

export function SubmissionResultModal({ submissionId, token, isOpen, onClose }: SubmissionResultModalProps) {
  const [result, setResult] = useState<StudentResultResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const latestMaterialId = sessionStorage.getItem('latest_material_id')
  const latestDistributionCode = sessionStorage.getItem('latest_distribution_code')

  const resultPagePath = submissionId ? `/student/submissions/${submissionId}` : ''
  const followUpPath = latestDistributionCode
    ? `/student/question-sets/${latestDistributionCode}/workspace`
    : latestMaterialId
      ? `/student/materials/${latestMaterialId}/qa`
      : '/student'
  const correctCount = result?.questionResults.filter((item) => item.correct).length ?? 0
  const wrongCount = result ? result.questionResults.length - correctCount : 0

  const storeWrongAnswerContext = (questionNumber: number, explanation: string, selectedOptionLabel: string, conceptTags: string[]) => {
    sessionStorage.setItem(
      'student_ai_followup_context',
      JSON.stringify({
        questionNumber,
        explanation,
        selectedOptionLabel,
        conceptTags,
        prompt: `문제 ${questionNumber}에서 내가 고른 ${selectedOptionLabel}가 왜 틀렸는지 자료 기준으로 짧고 친절하게 설명해 주세요.`,
      }),
    )
  }

  const createFallbackExplanation = (questionNumber: number) =>
    `문제 ${questionNumber}의 자세한 해설이 아직 준비되지 않았습니다. 아래 버튼으로 AI에게 다시 설명을 요청해 보세요.`

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
      {loading && (
        <div className="modal-status-state">
          <div className="loading-spinner" />
          <p className="modal-status-title">채점 결과를 불러오는 중입니다.</p>
          <p className="modal-status-description">제출 내용을 확인하고 있어요. 잠시만 기다려주세요.</p>
        </div>
      )}
      {error && (
        <div className="modal-status-state modal-status-state--error">
          <p className="modal-status-title">결과를 불러오지 못했습니다.</p>
          <p className="modal-status-description">{error}</p>
          <div className="page-actions page-actions--stacked">
            <Button variant="outline" onClick={onClose}>닫기</Button>
            {resultPagePath && <Link to={resultPagePath}><Button variant="primary">결과 페이지 열기</Button></Link>}
          </div>
        </div>
      )}
      {!loading && !error && !result && (
        <div className="modal-status-state">
          <p className="modal-status-title">결과가 아직 준비되지 않았습니다.</p>
          <p className="modal-status-description">제출은 완료되었지만 채점 데이터를 아직 찾지 못했습니다. 잠시 후 다시 열어보세요.</p>
          <div className="page-actions page-actions--stacked">
            <Button variant="outline" onClick={onClose}>닫기</Button>
            {resultPagePath && <Link to={resultPagePath}><Button variant="primary">결과 페이지 열기</Button></Link>}
          </div>
        </div>
      )}
      {!loading && !error && result && (
        <div className="submission-result-page">
          <Card className="score-card">
            <CardBody>
              <div className="score-display">
                <div className="score-value">{result.score} / {result.questionResults.length}</div>
                <div className="score-label">점수</div>
              </div>
              <div className="score-stats">
                <div className="stat-item"><span className="stat-value correct">{correctCount}</span><span className="stat-label">정답</span></div>
                <div className="stat-item"><span className="stat-value wrong">{wrongCount}</span><span className="stat-label">오답</span></div>
              </div>
            </CardBody>
          </Card>
          <div className="results-list">
            {result.questionResults.length === 0 ? (
              <Card className="info-card">
                <CardBody>
                  <p className="info-text">채점된 문항이 없습니다. 결과 페이지에서 다시 확인해 보세요.</p>
                </CardBody>
              </Card>
            ) : result.questionResults.map((question, index) => {
              const answerLabel = getSelectedOptionLabel(question.selectedOptionIndex)
              const explanation = question.explanation?.trim() || createFallbackExplanation(index + 1)
              const hasWrongAnswer = !question.correct
              const conceptTags = Array.isArray(question.conceptTags) ? question.conceptTags : []

              return (
              <Card key={`${question.questionId}-${index}`} className={`result-card ${question.correct ? 'correct' : 'wrong'}`}>
                <CardBody>
                  <div className="result-header">
                    <span className="result-number">문제 {index + 1}</span>
                    <span className={`result-badge ${question.correct ? 'correct' : 'wrong'}`}>{question.correct ? '정답' : '오답'}</span>
                  </div>
                  <div className="result-answer"><p><strong>선택한 답:</strong> {answerLabel}</p></div>
                  <div className="result-explanation"><strong>해설:</strong> {explanation}</div>
                  {hasWrongAnswer && (
                    <div className="result-follow-up">
                      <div className="result-follow-up-text">이 오답은 AI에게 다시 물어볼 수 있습니다. 선택한 답과 해설을 같이 보내 더 짧고 친절한 설명을 받으세요.</div>
                      <div className="page-actions page-actions--stacked">
                        <Link
                          to={followUpPath}
                          onClick={() => storeWrongAnswerContext(index + 1, explanation, answerLabel, conceptTags)}
                        >
                          <Button variant="outline">오답 AI 해설 요청</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  {conceptTags.length > 0 && (
                    <div className="result-tags"><strong>관련 개념:</strong> {conceptTags.map((tag) => <span key={tag} className="concept-tag">{tag}</span>)}</div>
                  )}
                </CardBody>
              </Card>
              )
            })}
          </div>
          <div className="page-actions page-actions--stacked">
            <Button variant="outline" onClick={onClose}>닫기</Button>
            {resultPagePath && <Link to={resultPagePath}><Button variant="primary">전체 결과 페이지 열기</Button></Link>}
          </div>
        </div>
      )}
    </Modal>
  )
}
