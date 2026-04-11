/**
 * 로그인 페이지
 * F1: 로그인 및 역할 기반 진입
 */

import { useState } from 'react'
import { useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, roleHomePaths } from '../auth'
import { Button, Input, Card, CardBody } from '../components'
import { login as loginApi, studentPinLogin } from '../api/auth'
import { searchSchools, type SchoolMasterResponse } from '../api/signup'
import './LoginPage.css'

type LoginTab = 'teacher' | 'student'

/**
 * 로그인 페이지 컴포넌트
 * 교사/운영자는 ID/PW 로그인, 학생은 PIN 로그인
 */
export function LoginPage() {
  const [activeTab, setActiveTab] = useState<LoginTab>('teacher')

  // Teacher/Operator login states
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')

  // Student PIN login states
  const [schools, setSchools] = useState<SchoolMasterResponse[]>([])
  const [schoolId, setSchoolId] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [pin, setPin] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  useEffect(() => {
    searchSchools('')
      .then((result) => {
        setSchools(result)
        setSchoolId((prev) => prev || result[0]?.schoolId || '')
      })
      .catch((err) => {
        console.error('학교 목록 조회 실패:', err)
      })
  }, [])

  /**
   * 교사/운영자 로그인 폼 제출 핸들러
   */
  const handleTeacherSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await loginApi({ loginId, password })
      await login(response.accessToken, response.refreshToken)
      const homePath = roleHomePaths[response.role]
      navigate(from || homePath, { replace: true })
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('로그인에 실패했습니다. 로그인 ID 또는 비밀번호를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 학생 PIN 로그인 폼 제출 핸들러
   */
  const handleStudentPinSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await studentPinLogin({ schoolId, studentCode, pin })
      await login(response.accessToken, response.refreshToken)
      const homePath = roleHomePaths[response.role]
      navigate(from || homePath, { replace: true })
    } catch (err) {
      console.error('PIN 로그인 실패:', err)
      setError('PIN 로그인에 실패했습니다. 학교, 학생 코드 또는 PIN을 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">Curator 로그인</h1>
          <p className="login-description">계정 유형을 선택하여 로그인합니다.</p>

          {/* Tab Navigation */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${activeTab === 'teacher' ? 'active' : ''}`}
              onClick={() => { setActiveTab('teacher'); setError(null) }}
            >
              교직원 / 운영자
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === 'student' ? 'active' : ''}`}
              onClick={() => { setActiveTab('student'); setError(null) }}
            >
              학생 (PIN)
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          {activeTab === 'teacher' ? (
            <form onSubmit={handleTeacherSubmit} className="login-form">
              <Input
                label="로그인 ID"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="로그인 ID를 입력하세요"
                required
              />
              <Input
                label="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
              <Button type="submit" loading={loading} className="login-button">
                로그인
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStudentPinSubmit} className="login-form">
              <label>
                학교
                <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="number-input">
                  <option value="">학교 선택</option>
                  {schools.map((school) => (
                    <option key={school.schoolId} value={school.schoolId}>{school.name}</option>
                  ))}
                </select>
              </label>
              <Input
                label="학생 코드"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="학교에서 안난 학생 코드를 입력하세요"
                required
              />
              <Input
                label="PIN 번호"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN 번호를 입력하세요"
                required
                maxLength={6}
              />
              <p className="login-hint">
                승인된 학교와 학생 코드, 학교에서 안난 PIN 번호로 로그인합니다.
              </p>
              <Button type="submit" loading={loading} className="login-button">
                PIN으로 로그인
              </Button>
            </form>
          )}

          <div className="demo-accounts">
            <h3 className="demo-title">가입 요청</h3>
            <div className="demo-buttons">
              <Link to="/signup/teacher">
                <Button variant="outline" size="sm">교직원 가입</Button>
              </Link>
              <Link to="/signup/student">
                <Button variant="outline" size="sm">학생 가입</Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
