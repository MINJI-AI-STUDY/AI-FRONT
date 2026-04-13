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
  const [pageDisplayMode, setPageDisplayMode] = useState<'single' | 'spread'>('spread')

  useEffect(() => {
    let objectUrl: string | null = null

    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/materials/document/${materialId}`, {
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
    <div className="document-viewer-shell workspace-document-stage">
      <div className="document-viewer-toolbar">
        <div className="document-viewer-toolbar-title">
          <strong>학습 문서</strong>
          <span className="document-viewer-helper">브라우저 PDF 뷰어 한계로 실제 페이지 전환/두쪽보기 강제 제어는 어렵지만, 문서가 화면의 중심이 되도록 우선 배치합니다.</span>
        </div>
        <div className="document-viewer-toolbar-actions">
          <div className="document-viewer-mode-group" role="group" aria-label="PDF 보기 방식 안내">
            <button type="button" className={`document-viewer-mode-chip ${pageDisplayMode === 'spread' ? 'active' : ''}`} onClick={() => setPageDisplayMode('spread')}>
              두쪽보기 우선
            </button>
            <button type="button" className={`document-viewer-mode-chip ${pageDisplayMode === 'single' ? 'active' : ''}`} onClick={() => setPageDisplayMode('single')}>
              한쪽보기
            </button>
          </div>
          <a className="document-viewer-link" href={documentUrl} target="_blank" rel="noreferrer">
            새 탭에서 열기
          </a>
        </div>
      </div>
      <div className="document-viewer-frame-shell">
        <iframe
          className="workspace-document-frame"
          src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
          title="학습 자료 PDF"
          loading="lazy"
        />
      </div>
    </div>
  )
}
