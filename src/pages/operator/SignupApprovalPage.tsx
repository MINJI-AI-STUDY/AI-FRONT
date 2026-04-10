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
    const reviewed = await reviewSignupRequest(signupRequestId, { approve, rejectionReason: approve ? null : '학교 운영자 반려' }, token)
    setRequests((prev) => prev.map((item) => item.signupRequestId === signupRequestId ? reviewed : item).filter((item) => item.status === 'PENDING'))
    if (approve && reviewed.provisionedLoginId) {
      alert(`승인 완료\n로그인 ID: ${reviewed.provisionedLoginId}\n초기 비밀번호: ${reviewed.provisionedTempPassword ?? '기존 비밀번호 사용'}`)
    }
  }

  return (
    <div className="operator-overview-page">
      <div className="page-header"><h1 className="page-title">가입 승인</h1><p className="page-description">학교별 교직원/학생 가입 요청을 승인 또는 반려합니다.</p></div>
      <Card className="summary-card"><CardBody>
        <label>학교 선택<select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', minWidth: '240px' }}>{schools.map((school) => <option key={school.schoolId} value={school.schoolId}>{school.name}</option>)}</select></label>
      </CardBody></Card>
      <Card className="summary-card" style={{ marginTop: '1rem' }}><CardBody>
        {requests.length === 0 ? <p className="page-description">대기 중인 가입 요청이 없습니다.</p> : <ul>{requests.map((item) => <li key={item.signupRequestId}>{item.requesterName} · {item.role} <Button variant="outline" onClick={() => handleReview(item.signupRequestId, true)}>승인</Button> <Button variant="danger" onClick={() => handleReview(item.signupRequestId, false)}>반려</Button></li>)}</ul>}
      </CardBody></Card>
    </div>
  )
}
