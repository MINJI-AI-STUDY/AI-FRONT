import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '../components'
import './LoginPage.css'

export function PrivacyNoticePage() {
  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">개인정보 수집·이용 안내</h1>
          <p className="login-description">가입 요청과 학교 운영을 위해 필요한 최소 개인정보를 안내합니다.</p>
          <div className="login-form">
            <p>수집 목적: 가입 요청 생성, 학교 운영자 승인, 계정 활성화</p>
            <p>수집 항목: 학교, 이름(학생은 실명), 로그인 ID/비밀번호(교직원), 학교 이메일(교직원)</p>
            <p>보유 기간: 계정 운영 및 승인 로그 보관 정책에 따름</p>
            <Link to="/login"><Button variant="outline">돌아가기</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
