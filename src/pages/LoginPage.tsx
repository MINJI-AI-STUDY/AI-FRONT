/**
 * 로그인 페이지
 * F1: 로그인 및 역할 기반 진입
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, roleHomePaths } from '../auth'
import { Button, Input, Card, CardBody } from '../components'
import { login as loginApi } from '../api/auth'
import './LoginPage.css'

/**
 * 로그인 페이지 컴포넌트
 * 데모 계정으로 교사/학생/운영자 진입을 지원합니다.
 */
export function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  /**
   * 로그인 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
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
   * 데모 계정으로 빠른 로그인
   */
  const handleDemoLogin = async (demoLoginId: string, demoPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await loginApi({ loginId: demoLoginId, password: demoPassword })
      await login(response.accessToken, response.refreshToken)
      const homePath = roleHomePaths[response.role]
      navigate(from || homePath, { replace: true })
    } catch (err) {
      console.error('데모 로그인 실패:', err)
      setError('데모 로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">AI-STUDY 로그인</h1>
          <p className="login-description">교사, 학생, 운영자 데모 계정으로 진입합니다.</p>
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <Input label="로그인 ID" type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="로그인 ID를 입력하세요" required />
            <Input label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" required />
            <Button type="submit" loading={loading} className="login-button">로그인</Button>
          </form>

          <div className="demo-accounts">
            <h3 className="demo-title">데모 계정</h3>
            <div className="demo-buttons">
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('teacher', 'teacher123')} disabled={loading}>교사 데모</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('student', 'student123')} disabled={loading}>학생 데모</Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('operator', 'operator123')} disabled={loading}>운영자 데모</Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
