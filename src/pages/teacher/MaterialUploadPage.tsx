/**
 * 자료 업로드 페이지
 * F2: 자료 업로드 및 분석 요청
 */

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth'
import { Button, Input, Card, CardBody } from '../../components'
import { uploadMaterial } from '../../api/teacher'
import './TeacherPages.css'

/**
 * 자료 업로드 페이지 컴포넌트
 */
export function MaterialUploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { token } = useAuth()
  const navigate = useNavigate()

  /**
   * 파일 선택 핸들러
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setError('PDF 파일만 업로드할 수 있습니다.')
      return
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('20MB 이하 PDF만 업로드할 수 있습니다.')
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  /**
   * 업로드 폼 제출 핸들러
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('파일을 선택해주세요.')
      return
    }

    if (!title.trim()) {
      setError('자료 제목을 입력해주세요.')
      return
    }

    if (!token) {
      setError('로그인이 필요합니다.')
      return
    }

    setLoading(true)

    try {
      const material = await uploadMaterial(file, { title: title.trim(), description: description.trim() || undefined }, token)
      navigate(`/teacher/materials/${material.materialId}`)
    } catch (err) {
      console.error('자료 업로드 실패:', err)
      setError('자료 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="material-upload-page">
      <div className="page-header">
        <div className="workspace-chip">자료 업로드</div>
        <h1 className="page-title">자료 업로드</h1>
        <p className="page-description">PDF 자료를 업로드하고 AI 분석을 요청합니다. 업로드가 완료되면 자료 상세 화면에서 분석 상태와 후속 작업을 이어갈 수 있습니다.</p>
      </div>

      <Card>
        <CardBody>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-helper-card">
              <strong>업로드 가이드</strong>
              <ul className="upload-helper-list">
                <li>PDF 파일만 업로드할 수 있습니다.</li>
                <li>최대 파일 크기는 20MB입니다.</li>
                <li>제목은 학생과 교사가 모두 보게 되므로 이해하기 쉽게 작성하세요.</li>
              </ul>
            </div>
            <Input label="자료 제목" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="자료 제목을 입력하세요" required />

            <div className="form-group">
              <label className="input-label">설명 (선택)</label>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자료에 대한 설명을 입력하세요" rows={3} />
            </div>

            <div className="form-group">
              <label className="input-label">PDF 파일</label>
              <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="file-input" />
              <p className="file-info">PDF · 최대 20MB · 업로드 후 AI 분석이 자동으로 시작됩니다.</p>
              {file && <p className="file-info">선택된 파일: {file.name}</p>}
            </div>

            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate('/teacher')}>
                취소
              </Button>
              <Button type="submit" loading={loading}>업로드</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
