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
        <h1 className="page-title">배포 코드 입력</h1>
        <p className="page-description">교사가 공유한 배포 코드를 입력하여 문제 세트에 참여하세요.</p>
      </div>

      <Card>
        <CardBody>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="join-form">
            <Input
              label="배포 코드"
              type="text"
              value={distributionCode}
              onChange={(e) => setDistributionCode(e.target.value)}
              placeholder="배포 코드를 입력하세요"
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
