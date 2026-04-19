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
  const [studentCodes, setStudentCodes] = useState<Record<string, string>>({})
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
    getPendingSignupRequests(selectedSchoolId, token)
      .then((data) => {
        setRequests(data)
        setStudentCodes(
          data.reduce<Record<string, string>>((acc, item) => {
            if (item.role === 'STUDENT' && item.studentCode) {
              acc[item.signupRequestId] = item.studentCode
            }
            return acc
          }, {}),
        )
      })
      .catch((err) => console.error('가입 요청 조회 실패:', err))
  }, [selectedSchoolId, token])

  const handleReview = async (signupRequestId: string, approve: boolean) => {
    if (!token) return
    const requestedStudentCode = studentCodes[signupRequestId]?.trim()
    const reviewed = await reviewSignupRequest(
      signupRequestId,
      {
        approve,
        rejectionReason: approve ? null : (rejectionReasons[signupRequestId]?.trim() || '학교 운영자 반려'),
        studentCode: approve ? (requestedStudentCode || undefined) : undefined,
      },
      token,
    )
    setRequests((prev) => prev.map((item) => item.signupRequestId === signupRequestId ? reviewed : item).filter((item) => item.status === 'PENDING'))
    setRejectionReasons((prev) => {
      const next = { ...prev }
      delete next[signupRequestId]
      return next
    })
    setStudentCodes((prev) => {
      const next = { ...prev }
      delete next[signupRequestId]
      return next
    })
    setNotice(null)
    if (approve && reviewed.role === 'TEACHER' && reviewed.provisionedLoginId) {
      setNotice(`승인 완료 · 로그인 ID: ${reviewed.provisionedLoginId} · 초기 비밀번호: ${reviewed.provisionedTempPassword ?? '기존 비밀번호 사용'}`)
    } else if (approve && reviewed.role === 'STUDENT') {
      setNotice(`학생 승인 완료 · 학생 코드 ${reviewed.studentCode ?? '자동 생성'} · 학생은 학교, 학생 코드, PIN으로 로그인합니다.`)
    }
  }

  return (
    <div className="operator-overview-page">
      <div className="page-header"><h1 className="page-title">가입 승인</h1><p className="page-description">학교별 교직원/학생 가입 요청을 승인 또는 반려합니다.</p></div>
      <Card className="summary-card"><CardBody>
        <label>학교 선택<select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)} style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', minWidth: '240px' }}>{schools.map((school) => <option key={school.schoolId} value={school.schoolId}>{school.name}</option>)}</select></label>
      </CardBody></Card>
      {notice ? <Card className="summary-card" style={{ marginTop: '1rem' }}><CardBody><p className="page-description">{notice}</p></CardBody></Card> : null}
      <Card className="summary-card" style={{ marginTop: '1rem' }}><CardBody>
        {requests.length === 0 ? <p className="page-description">대기 중인 가입 요청이 없습니다.</p> : <ul>{requests.map((item) => <li key={item.signupRequestId} style={{ marginBottom: '1rem' }}><div style={{ marginBottom: '0.5rem' }}>{item.requesterName} · {item.role}</div>{item.role === 'STUDENT' ? <><input value={studentCodes[item.signupRequestId] ?? ''} onChange={(e) => setStudentCodes((prev) => ({ ...prev, [item.signupRequestId]: e.target.value }))} placeholder="학생 코드(비우면 자동 생성)" className="number-input" style={{ marginBottom: '0.5rem', width: '100%' }} /><p className="page-description" style={{ marginBottom: '0.5rem' }}>학생 코드는 요청값을 확인하거나 승인 시 새로 지정할 수 있습니다.</p></> : null}<input value={rejectionReasons[item.signupRequestId] ?? ''} onChange={(e) => setRejectionReasons((prev) => ({ ...prev, [item.signupRequestId]: e.target.value }))} placeholder="반려 사유(선택)" className="number-input" style={{ marginBottom: '0.5rem', width: '100%' }} /><div style={{ display: 'flex', gap: '0.5rem' }}><Button variant="outline" onClick={() => handleReview(item.signupRequestId, true)}>승인</Button> <Button variant="danger" onClick={() => handleReview(item.signupRequestId, false)}>반려</Button></div></li>)}</ul>}
      </CardBody></Card>
    </div>
  )
}
