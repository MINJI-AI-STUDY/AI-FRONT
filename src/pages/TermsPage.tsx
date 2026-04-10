import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '../components'
import './LoginPage.css'

export function TermsPage() {
  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">서비스 이용약관</h1>
          <p className="login-description">학교 기반 학습 서비스 이용을 위한 기본 약관입니다.</p>
          <div className="login-form">
            <p>본 서비스는 학교 단위 운영, 승인 기반 가입, 역할별 권한 통제를 전제로 합니다.</p>
            <p>교사/학생 계정은 학교 운영 정책에 따라 생성·승인·제한될 수 있습니다.</p>
            <Link to="/login"><Button variant="outline">돌아가기</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
