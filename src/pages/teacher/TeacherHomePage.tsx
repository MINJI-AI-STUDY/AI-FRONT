/**
 * 교사 홈 페이지
 * 교사 기능 진입점
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import './TeacherPages.css'

/**
 * 교사 홈 페이지 컴포넌트
 */
export function TeacherHomePage() {
  const { user } = useAuth()

  return (
    <div className="teacher-home">
      <div className="page-header">
        <h1 className="page-title">교사 홈</h1>
        <p className="page-description">
          안녕하세요, {user?.displayName}님. 자료 업로드와 분석 상태 확인을 시작하세요.
        </p>
      </div>

      <div className="action-cards">
        <Card className="action-card">
          <CardBody>
            <h3 className="action-title">자료 업로드</h3>
            <p className="action-description">PDF 자료를 업로드하고 AI 분석을 요청합니다.</p>
            <Link to="/teacher/materials/new">
              <Button variant="primary">자료 업로드</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
