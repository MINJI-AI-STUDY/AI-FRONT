/**
 * 개인정보 동의 모달
 * 개인정보 수집·이용 동의를 모달 형태로 제공합니다.
 */

import { Modal } from '../Modal'
import { Button } from '../Button'
import { Card, CardBody } from '../Card'
import type { PrivacyConsentResponse } from '../../api/auth'

interface PrivacyConsentModalProps {
  isOpen: boolean
  onClose: () => void
  privacyConsent?: PrivacyConsentResponse
  onConsent: (consented: boolean) => void
  userName?: string
  userRole?: string
}

export function PrivacyConsentModal({
  isOpen,
  onClose,
  privacyConsent,
  onConsent,
  userName,
  userRole,
}: PrivacyConsentModalProps) {
  const formatRole = (role: string | undefined) => {
    if (!role) return ''
    return role === 'TEACHER' ? '교사' : role === 'STUDENT' ? '학생' : '운영자'
  }

  const formatDate = (value: string | null | undefined) => {
    if (!value) return '기록 없음'
    return new Date(value).toLocaleString('ko-KR')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="개인정보 수집·이용 안내"
      size="lg"
    >
      <div className="privacy-modal-content">
        {userName && (
          <div className="privacy-user-banner">
            <div className="privacy-user-info">
              <span className="privacy-user-label">현재 로그인</span>
              <span className="privacy-user-name">{userName}</span>
              {userRole && (
                <span className={`privacy-user-role role-${userRole.toLowerCase()}`}>
                  {formatRole(userRole)}
                </span>
              )}
            </div>
          </div>
        )}

        <Card className="privacy-section-card">
          <CardBody>
            <section className="privacy-section">
              <h3 className="privacy-section-title">수집 목적</h3>
              <p className="privacy-section-text">
                가입 요청 생성, 학교 운영자 승인, 계정 활성화 및 교육 서비스 제공
              </p>
            </section>
          </CardBody>
        </Card>

        <Card className="privacy-section-card">
          <CardBody>
            <section className="privacy-section">
              <h3 className="privacy-section-title">수집 항목</h3>
              <ul className="privacy-list">
                <li>학교 정보 (학교 ID)</li>
                <li>학생 코드 (학생)</li>
                <li>이름 (학생은 실명)</li>
                <li>로그인 ID / 비밀번호 (교직원)</li>
                <li>PIN (학생 로그인 인증용)</li>
                <li>학교 이메일 (교직원)</li>
              </ul>
            </section>
          </CardBody>
        </Card>

        <Card className="privacy-section-card">
          <CardBody>
            <section className="privacy-section">
              <h3 className="privacy-section-title">보유 기간</h3>
              <p className="privacy-section-text">
                계정 운영 및 승인 로그 보관 정책에 따름
              </p>
            </section>
          </CardBody>
        </Card>

        {privacyConsent && (
          <Card className="privacy-section-card privacy-consent-card">
            <CardBody>
              <section className="privacy-section privacy-consent-section">
                <h3 className="privacy-section-title">동의 상태</h3>
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
                  최근 처리 시각: {formatDate(privacyConsent?.updatedAt)}
                </p>
              </section>
            </CardBody>
          </Card>
        )}

        <div className="privacy-modal-actions">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button
            variant={privacyConsent?.consented ? 'outline' : 'primary'}
            onClick={() => onConsent(!privacyConsent?.consented)}
          >
            {privacyConsent?.consented ? '동의 철회' : '동의하기'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
