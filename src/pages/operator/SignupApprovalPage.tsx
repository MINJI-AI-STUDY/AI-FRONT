import { useEffect, useState } from 'react'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import { getPendingSignupRequests, reviewSignupRequest, type SignupRequestResponse } from '../../api/signup'
import { getSchools, type SchoolResponse } from '../../api/operator'
import './OperatorPages.css'

export function SignupApprovalPage() {
  const { token } = useAuth()
  const [schools, setSchools] = useState<SchoolResponse[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState('')
  const [requests, setRequests] = useState<SignupRequestResponse[]>([])
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getSchools(token).then((data) => {
      setSchools(data)
      setSelectedSchoolId(data[0]?.schoolId ?? '')
    }).catch((err) => console.error('학교 목록 조회 실패:', err))
  }, [token])

  useEffect(() => {
    if (!token || !selectedSchoolId) return
    getPendingSignupRequests(selectedSchoolId, token).then(setRequests).catch((err) => console.error('가입 요청 조회 실패:', err))
  }, [selectedSchoolId, token])

  const handleReview = async (signupRequestId: string, approve: boolean) => {
    if (!token) return
    const reviewed = await reviewSignupRequest(
      signupRequestId,
      {
        approve,
        rejectionReason: approve ? null : (rejectionReasons[signupRequestId]?.trim() || '학교 운영자 반려'),
      },
      token,
    )
    setRequests((prev) => prev.map((item) => item.signupRequestId === signupRequestId ? reviewed : item).filter((item) => item.status === 'PENDING'))
    setRejectionReasons((prev) => {
      const next = { ...prev }
      delete next[signupRequestId]
      return next
    })
    setNotice(null)
    if (approve && reviewed.role === 'TEACHER' && reviewed.provisionedLoginId) {
      setNotice(`승인 완료 · 로그인 ID: ${reviewed.provisionedLoginId} · 초기 비밀번호: ${reviewed.provisionedTempPassword ?? '기존 비밀번호 사용'}`)
    } else if (approve && reviewed.role === 'STUDENT') {
      setNotice('학생 승인 완료 · 학생은 학교, 실명, PIN으로 로그인합니다.')
    }
  }

  const selectedSchoolName = schools.find((school) => school.schoolId === selectedSchoolId)?.name ?? '학교를 선택하세요'

  return (
    <div className="operator-overview-page">
      <div className="page-header">
        <h1 className="page-title">가입 승인</h1>
        <p className="page-description">학교별 교직원·학생 가입 요청을 한 화면에서 검토하고 승인 또는 반려합니다.</p>
      </div>

      <div className="operator-approval-layout">
        <Card className="summary-card operator-approval-filter-card">
          <CardBody>
            <div className="operator-card-eyebrow">승인 대상 학교</div>
            <div className="operator-approval-filter-row">
              <div>
                <h2 className="operator-approval-title">{selectedSchoolName}</h2>
                <p className="operator-approval-description">학교를 바꾸면 해당 학교의 대기 중 가입 요청만 바로 다시 불러옵니다.</p>
              </div>
              <label className="operator-approval-select-field">
                <span>학교 선택</span>
                <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
                  {schools.map((school) => <option key={school.schoolId} value={school.schoolId}>{school.name}</option>)}
                </select>
              </label>
            </div>
          </CardBody>
        </Card>

        {notice ? (
          <Card className="summary-card operator-approval-notice-card">
            <CardBody>
              <div className="operator-card-eyebrow">최근 처리 결과</div>
              <p className="operator-approval-notice">{notice}</p>
            </CardBody>
          </Card>
        ) : null}

        <Card className="summary-card operator-approval-list-card">
          <CardBody>
            <div className="operator-approval-list-header">
              <div>
                <div className="operator-card-eyebrow">대기 중 요청</div>
                <h2 className="operator-approval-title">가입 승인 큐</h2>
              </div>
              <div className="operator-approval-count">{requests.length}건</div>
            </div>

            {requests.length === 0 ? (
              <div className="operator-approval-empty">
                <p className="page-description">대기 중인 가입 요청이 없습니다.</p>
              </div>
            ) : (
              <ul className="operator-approval-list">
                {requests.map((item) => (
                  <li key={item.signupRequestId} className="operator-approval-item">
                    <div className="operator-approval-item-header">
                      <div>
                        <strong>{item.requesterName}</strong>
                        <p className="operator-approval-item-meta">
                          {item.role === 'TEACHER' ? '교직원' : '학생'}
                          {item.studentCode ? ` · 학생 코드 ${item.studentCode}` : ''}
                          {item.loginId ? ` · 요청 ID ${item.loginId}` : ''}
                          {item.schoolEmail ? ` · ${item.schoolEmail}` : ''}
                        </p>
                      </div>
                      <span className={`operator-approval-badge ${item.role.toLowerCase()}`}>
                        {item.role === 'TEACHER' ? '교직원' : '학생'}
                      </span>
                    </div>

                    <input
                      value={rejectionReasons[item.signupRequestId] ?? ''}
                      onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [item.signupRequestId]: e.target.value }))}
                      placeholder="반려 사유를 입력하면 반려 시 함께 저장됩니다."
                      className="number-input operator-approval-reason"
                    />

                    <div className="operator-approval-actions">
                      <Button variant="outline" onClick={() => handleReview(item.signupRequestId, true)}>승인</Button>
                      <Button variant="danger" onClick={() => handleReview(item.signupRequestId, false)}>반려</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
