import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, CardBody, Input, SchoolSearchInput } from '../components'
import { createTeacherSignup } from '../api/signup'
import './LoginPage.css'

export function TeacherSignupPage() {
  const [schoolId, setSchoolId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [schoolEmail, setSchoolEmail] = useState('')
  const [consentTerms, setConsentTerms] = useState(false)
  const [consentPrivacy, setConsentPrivacy] = useState(false)
  const [consentStudentNotice, setConsentStudentNotice] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [schoolError, setSchoolError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setError(null)
      setSchoolError(null)

      if (!schoolId) {
        setSchoolError('학교를 선택해주세요')
        return
      }

      const response = await createTeacherSignup({ schoolId, displayName, loginId, password, schoolEmail, consentTerms, consentPrivacy, consentStudentNotice })
      setMessage(`가입 요청이 접수되었습니다. 현재 상태는 ${response.status}이며, 학교 운영자 승인 후 로그인할 수 있습니다.`)
    } catch (err) {
      console.error('교직원 가입 요청 실패:', err)
      setError('가입 요청에 실패했습니다.')
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">교직원 가입 요청</h1>
          <p className="login-description">학교 이메일과 학교 선택을 통해 가입 요청을 생성합니다. 승인 전까지는 로그인할 수 없습니다.</p>
          {message && <div className="login-error" style={{ background: '#ecfdf5', color: '#166534', borderColor: '#86efac' }}>{message}</div>}
          {error && <div className="login-error">{error}</div>}
          <div className="login-form">
            <SchoolSearchInput
              onChange={(id) => { setSchoolId(id); setSchoolError(null) }}
              error={schoolError || undefined}
            />
            <Input label="이름" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label="로그인 ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
            <Input label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="학교 이메일" type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} />
            <label><input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} /> <Link to="/legal/terms">서비스 이용약관</Link> 동의</label>
            <label><input type="checkbox" checked={consentPrivacy} onChange={(e) => setConsentPrivacy(e.target.checked)} /> <Link to="/legal/privacy">개인정보 수집·이용</Link> 동의</label>
            <label><input type="checkbox" checked={consentStudentNotice} onChange={(e) => setConsentStudentNotice(e.target.checked)} /> <Link to="/legal/student-notice">학생/학교 서비스 고지</Link> 확인</label>
            <Button onClick={handleSubmit}>가입 요청</Button>
            <Link to="/login"><Button variant="outline">로그인으로 돌아가기</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
