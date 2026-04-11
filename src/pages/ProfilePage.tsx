import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Button } from '../components'
import { useAuth } from '../auth'
import './ProfilePage.css'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get initials from display name
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  const formatRole = (role: string) => {
    return role === 'TEACHER' ? '교사' : role === 'STUDENT' ? '학생' : '운영자'
  }

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString('ko-KR')
  }

  const privacyConsent = user?.privacyConsents.find((consent) => consent.consentType === 'privacy_notice')

  if (!user) {
    return (
      <div className="profile-page">
        <Card className="profile-card">
          <CardBody>
            <div className="profile-loading">사용자 정보를 불러오는 중...</div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Card className="profile-card">
        <CardBody>
          <div className="profile-header">
            <div className="profile-avatar-large">
              {getInitials(user.displayName)}
            </div>
            <div className="profile-title-section">
              <h1 className="profile-name">{user.displayName}</h1>
              <span className={`profile-role-badge role-${user.role.toLowerCase()}`}>
                {formatRole(user.role)}
              </span>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">계정 정보</h2>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">사용자 ID</span>
                <span className="profile-info-value">{user.userId}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">학교 ID</span>
                <span className="profile-info-value">{user.schoolId}</span>
              </div>
              {user.classroomId && (
                <div className="profile-info-item">
                  <span className="profile-info-label">교실 ID</span>
                  <span className="profile-info-value">{user.classroomId}</span>
                </div>
              )}
              <div className="profile-info-item">
                <span className="profile-info-label">역할</span>
                <span className="profile-info-value">{formatRole(user.role)}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">계정 상태</span>
                <span className="profile-info-value">{user.active ? '활성' : '비활성'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">가입 일시</span>
                <span className="profile-info-value">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">개인정보 동의 현황</h2>
            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">개인정보 처리방침</span>
                <span className="profile-info-value">
                  {privacyConsent?.consented ? '동의 완료' : '미동의'}
                </span>
              </div>
              {privacyConsent?.updatedAt && (
                <div className="profile-info-item">
                  <span className="profile-info-label">최근 처리 시각</span>
                  <span className="profile-info-value">{formatDate(privacyConsent.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <Button variant="outline" onClick={() => navigate('/legal/privacy')}>
              개인정보 처리방침
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
