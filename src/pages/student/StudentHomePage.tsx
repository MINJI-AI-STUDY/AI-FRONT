/**
 * 학생 홈 페이지
 * 학생 기능 진입점
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Card, CardBody } from '../../components'
import './StudentPages.css'

/**
 * 학생 홈 페이지 컴포넌트
 */
export function StudentHomePage() {
  const { user } = useAuth()
  const latestSubmissionId = sessionStorage.getItem('latest_submission_id')
  const latestMaterialId = sessionStorage.getItem('latest_material_id')

  return (
    <div className="student-home">
      <div className="page-header">
        <h1 className="page-title">학생 홈</h1>
        <p className="page-description">안녕하세요, {user?.displayName}님. 배포 코드로 문제 세트에 참여하세요.</p>
      </div>

      <div className="action-cards">
        <Card className="action-card">
          <CardBody>
            <h3 className="action-title">문제 세트 참여</h3>
            <p className="action-description">교사가 공유한 배포 코드를 입력하여 문제 세트에 참여합니다.</p>
            <Link to="/student/join">
              <Button variant="primary">배포 코드 입력</Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="action-card">
          <CardBody>
            <h3 className="action-title">결과 확인</h3>
            <p className="action-description">가장 최근에 제출한 문제 세트의 결과와 해설을 확인합니다.</p>
            <Link to={latestSubmissionId ? `/student/submissions/${latestSubmissionId}` : '/student/join'}>
              <Button variant="outline">{latestSubmissionId ? '최근 결과 보기' : '먼저 문제 참여'}</Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="action-card">
          <CardBody>
            <h3 className="action-title">자료 기반 AI 질의응답</h3>
            <p className="action-description">가장 최근에 풀이한 자료를 기준으로 질문할 수 있습니다.</p>
            <Link to={latestSubmissionId ? `/student/question-sets/${sessionStorage.getItem('latest_distribution_code') ?? ''}/workspace` : '/student'}>
              <Button variant="outline" disabled={!latestMaterialId}>{latestMaterialId ? '자료 질문하기' : '먼저 문제 참여'}</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
