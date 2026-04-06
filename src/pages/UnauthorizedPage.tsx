/**
 * 접근 거부 페이지
 * 권한 없는 접근 시 표시되는 페이지입니다.
 */

import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '../components'
import { useAuth, roleHomePaths } from '../auth'
import './UnauthorizedPage.css'

/**
 * 접근 거부 페이지 컴포넌트
 */
export function UnauthorizedPage() {
  const { user, logout } = useAuth()

  /**
   * 로그아웃 핸들러
   */
  const handleLogout = () => {
    logout()
  }

  const homePath = user ? roleHomePaths[user.role] : '/login'

  return (
    <div className="unauthorized-page">
      <Card className="unauthorized-card">
        <CardBody>
          <div className="unauthorized-icon">⚠️</div>
          <h1 className="unauthorized-title">접근 권한 없음</h1>
          <p className="unauthorized-description">이 페이지에 접근할 권한이 없습니다.</p>
          {user && <p className="unauthorized-info">현재 <strong>{getRoleName(user.role)}</strong>로 로그인되어 있습니다.</p>}
          <div className="unauthorized-actions">
            <Link to={homePath}><Button variant="primary">홈으로 이동</Button></Link>
            <Button variant="outline" onClick={handleLogout}>로그아웃</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * 역할 이름 변환 함수
 */
function getRoleName(role: string): string {
  const roleNames: Record<string, string> = { TEACHER: '교사', STUDENT: '학생', OPERATOR: '운영자' }
  return roleNames[role] || role
}
