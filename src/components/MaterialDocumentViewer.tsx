/**
 * 자료 PDF 뷰어 컴포넌트
 * 인증 토큰으로 PDF를 받아 화면에 렌더링합니다.
 */

import { useEffect, useState } from 'react'

interface MaterialDocumentViewerProps {
  materialId: string
  token: string
}

export function MaterialDocumentViewer({ materialId, token }: MaterialDocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null

    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/teacher/materials/document/${materialId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`문서 조회 실패: ${response.status}`)
        }
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        setDocumentUrl(objectUrl)
      } catch (err) {
        console.error('문서 로딩 실패:', err)
        setError('문서를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [materialId, token])

  if (loading) {
    return <div className="workspace-document-placeholder">문서를 불러오는 중...</div>
  }

  if (error || !documentUrl) {
    return <div className="workspace-document-placeholder error">{error ?? '문서를 찾을 수 없습니다.'}</div>
  }

  return (
    <iframe
      className="workspace-document-frame"
      src={documentUrl}
      title="학습 자료 PDF"
    />
  )
}
