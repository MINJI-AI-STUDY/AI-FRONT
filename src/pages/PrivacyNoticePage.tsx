import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '../components'
import { useAuth } from '../auth'
import { updatePrivacyConsent } from '../api/auth'
import './PrivacyNoticePage.css'

export function PrivacyNoticePage() {
  const { user, token, loading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const isAuthenticated = !!token
  const isUserResolved = !loading && !!user

  const privacyConsent = user?.privacyConsents.find((consent) => consent.consentType === 'privacy_notice')

  const handleConsent = async (consented: boolean) => {
    if (!token) {
      return
    }

    try {
      await updatePrivacyConsent({ consentType: 'privacy_notice', consented }, token)
      await refreshUser()
    } catch (error) {
      console.error('개인정보 동의 상태 저장 실패:', error)
    }
  }

  const formatRole = (role: string) => {
    return role === 'TEACHER' ? '교사' : role === 'STUDENT' ? '학생' : '운영자'
  }

  const formatDate = (value: string | null) => {
    if (!value) {
      return '기록 없음'
    }

    return new Date(value).toLocaleString('ko-KR')
  }

  return (
    <div className="privacy-page">
      <Card className="privacy-card">
        <CardBody>
          <div className="privacy-header">
            <h1 className="privacy-title">개인정보 수집·이용 안내</h1>
            <p className="privacy-description">
              가입 요청과 학교 운영을 위해 필요한 최소 개인정보를 안내합니다.
            </p>
          </div>

          {isUserResolved && user && (
            <div className="privacy-user-banner">
              <div className="privacy-user-info">
                <span className="privacy-user-label">현재 로그인</span>
                <span className="privacy-user-name">{user.displayName}</span>
                <span className={`privacy-user-role role-${user.role.toLowerCase()}`}>
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          )}

          <div className="privacy-content">
            <section className="privacy-section">
              <h2 className="privacy-section-title">수집 목적</h2>
              <p className="privacy-section-text">
                가입 요청 생성, 학교 운영자 승인, 계정 활성화 및 교육 서비스 제공
              </p>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section-title">수집 항목</h2>
              <ul className="privacy-list">
                <li>학교 정보 (학교 ID)</li>
                <li>이름 (학생은 실명)</li>
                <li>로그인 ID / 비밀번호 (교직원)</li>
                <li>학교 이메일 (교직원)</li>
                {user?.classroomId && <li>교실 ID</li>}
              </ul>
            </section>

            <section className="privacy-section">
              <h2 className="privacy-section-title">보유 기간</h2>
              <p className="privacy-section-text">
                계정 운영 및 승인 로그 보관 정책에 따름
              </p>
            </section>

            {isAuthenticated && loading && (
              <section className="privacy-section privacy-consent-section">
                <h2 className="privacy-section-title">동의 상태</h2>
                <p className="privacy-consent-note">동의 상태를 불러오는 중입니다.</p>
              </section>
            )}

            {isUserResolved && (
              <section className="privacy-section privacy-consent-section">
                <h2 className="privacy-section-title">동의 상태</h2>
                <div className="privacy-consent-list">
                  <div className="privacy-consent-item">
                    <span className="material-symbols-outlined privacy-consent-icon">
                      {privacyConsent?.consented ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="privacy-consent-label">개인정보 수집·이용 동의</span>
                    <span className="privacy-consent-status">
                      {privacyConsent?.consented ? '동의 완료' : '미동의'}
                    </span>
                  </div>
                </div>
                <p className="privacy-consent-note">
                  최근 처리 시각: {formatDate(privacyConsent?.updatedAt ?? null)}
                </p>
                <div className="privacy-actions privacy-inline-actions">
                  <Button onClick={() => void handleConsent(true)}>동의하기</Button>
                  <Button variant="outline" onClick={() => void handleConsent(false)}>
                    동의 철회
                  </Button>
                </div>
              </section>
            )}
          </div>

          <div className="privacy-actions">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  프로필로 돌아가기
                </Button>
                <Link to="/">
                  <Button variant="secondary">홈으로</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">로그인으로 돌아가기</Button>
                </Link>
                <Link to="/legal/terms">
                  <Button variant="secondary">이용약관 보기</Button>
                </Link>
              </>
            )}
          </div>

          <div className="privacy-footer">
            <p className="privacy-footer-text">
              문의사항이 있으시면 학교 운영자에게 문의해 주세요.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
