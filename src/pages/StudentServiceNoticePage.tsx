import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '../components'
import './LoginPage.css'

export function StudentServiceNoticePage() {
  return (
    <div className="login-page">
      <Card className="login-card">
        <CardBody>
          <h1 className="login-title">학생 서비스 고지</h1>
          <p className="login-description">학생 계정은 학교 운영자 승인 후 활성화됩니다.</p>
          <div className="login-form">
            <p>학생은 학교 선택과 실명 기반으로 가입 요청을 생성합니다.</p>
            <p>학교 운영자는 가입 요청을 승인 또는 반려할 수 있습니다.</p>
            <p>미성년자 서비스 운영 시 별도 고지/보호자 확인 정책이 추가될 수 있습니다.</p>
            <Link to="/login"><Button variant="outline">돌아가기</Button></Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
