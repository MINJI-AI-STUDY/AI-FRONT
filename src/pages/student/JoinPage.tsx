/**
 * 배포 코드 입력 페이지
 * F4: 배포 코드로 문제 세트 입장
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, CardBody } from '../../components'
import './StudentPages.css'

/**
 * 배포 코드 입력 페이지 컴포넌트
 */
export function JoinPage() {
  const [distributionCode, setDistributionCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const code = distributionCode.trim().toUpperCase()

    if (!code) {
      setError('배포 코드를 입력해주세요.')
      return
    }

    navigate(`/student/question-sets/${code}`)
  }

  return (
    <div className="join-page">
      <div className="page-header">
        <div className="workspace-chip">문제 세트 참여</div>
        <h1 className="page-title">배포 코드 입력</h1>
        <p className="page-description">교사가 공유한 배포 코드를 입력하여 문제 세트에 참여하세요.</p>
      </div>

      <Card>
        <CardBody>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="join-form">
            <div className="join-helper-card">
              <strong>입력 전에 확인하세요</strong>
              <ul className="join-helper-list">
                <li>배포 코드는 영문/숫자 조합으로 공유됩니다.</li>
                <li>코드를 입력하면 바로 문제 세트 입장 화면으로 이동합니다.</li>
                <li>입력이 틀리면 다음 화면에서 유효하지 않은 코드 안내를 받게 됩니다.</li>
              </ul>
            </div>
            <Input
              label="배포 코드"
              type="text"
              value={distributionCode}
              onChange={(e) => setDistributionCode(e.target.value)}
              placeholder="예: ABC123"
              required
            />

            <div className="form-actions">
              <Button type="submit">참여하기</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
