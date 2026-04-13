/**
 * 자료 PDF 뷰어 컴포넌트
 * 인증 토큰으로 PDF를 받아 화면에 렌더링합니다.
 *
 * 뷰포트 너비에 따라 한쪽/두쪽 보기 모드를 자동 전환합니다.
 * 사용자가 수동으로 모드를 선택한 경우 뷰포트가 허용하는 한 그 선택을 존중합니다.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkspaceShell } from '../hooks/useWorkspaceShell'
import type { PageDisplayMode } from '../hooks/useWorkspaceShell'

interface MaterialDocumentViewerProps {
  materialId: string
  token: string
}

export function MaterialDocumentViewer({ materialId, token }: MaterialDocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { defaultPageDisplayMode } = useWorkspaceShell()

  // Track whether the user has explicitly chosen a mode (vs viewport-driven default).
  const [userSelectedMode, setUserSelectedMode] = useState<PageDisplayMode | null>(null)
  // Track whether viewport is currently forcing single-page due to width constraint.
  const viewportForcesSingleRef = useRef(false)

  // Resolve effective display mode:
  // 1. If viewport forces single (width < READABLE_PDF_MIN_WIDTH) → always single
  // 2. If user manually selected a mode → respect it (as long as viewport allows)
  // 3. Otherwise → use viewport-aware default from useWorkspaceShell
  const pageDisplayMode: PageDisplayMode =
    defaultPageDisplayMode === 'single' ? 'single' : (userSelectedMode ?? defaultPageDisplayMode)

  // When viewport forces single-page, clear any user selection for 'spread'
  // so that when viewport recovers we can return to spread automatically.
  useEffect(() => {
    if (defaultPageDisplayMode === 'single') {
      viewportForcesSingleRef.current = true
      setUserSelectedMode(null)
    } else if (viewportForcesSingleRef.current) {
      // Viewport recovered — clear user selection so we auto-return to spread
      viewportForcesSingleRef.current = false
      setUserSelectedMode(null)
    }
  }, [defaultPageDisplayMode])

  const handleSetPageDisplayMode = useCallback((mode: PageDisplayMode) => {
    setUserSelectedMode(mode)
  }, [])

  const [currentPage, setCurrentPage] = useState(1)

  const leftPage = pageDisplayMode === 'spread' ? currentPage : currentPage
  const rightPage = pageDisplayMode === 'spread' ? currentPage + 1 : null

  const buildViewerUrl = (page: number) => `${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${page}&view=FitH`

  const handlePrevious = () => {
    setCurrentPage((current) => Math.max(1, current - (pageDisplayMode === 'spread' ? 2 : 1)))
  }

  const handleNext = () => {
    setCurrentPage((current) => current + (pageDisplayMode === 'spread' ? 2 : 1))
  }

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
    <div className="document-viewer-shell workspace-document-stage" data-testid="pdf-shell">
      <div className="document-viewer-toolbar">
        <div className="document-viewer-toolbar-title">
          <strong>학습 문서</strong>
          <span className="document-viewer-helper">브라우저 PDF 뷰어 한계로 실제 페이지 전환/두쪽보기 강제 제어는 어렵지만, 문서가 화면의 중심이 되도록 우선 배치합니다.</span>
        </div>
        <div className="document-viewer-toolbar-actions">
          <div className="document-viewer-page-controls">
            <button type="button" className="document-viewer-nav-button" onClick={handlePrevious} disabled={currentPage <= 1}>
              이전 페이지
            </button>
            <span className="document-viewer-page-indicator">
              {pageDisplayMode === 'spread' ? `${leftPage}-${rightPage}` : `${leftPage}`} 페이지
            </span>
            <button type="button" className="document-viewer-nav-button" onClick={handleNext}>
              다음 페이지
            </button>
          </div>
        <div className="document-viewer-mode-group" data-testid="pdf-page-mode-toggle">
            <button
              type="button"
              className={`document-viewer-mode-chip ${pageDisplayMode === 'spread' ? 'active' : ''}`}
              onClick={() => handleSetPageDisplayMode('spread')}
              disabled={defaultPageDisplayMode === 'single'}
              data-testid="pdf-page-mode-toggle-spread"
            >
              두쪽보기 우선
            </button>
            <button
              type="button"
              className={`document-viewer-mode-chip ${pageDisplayMode === 'single' ? 'active' : ''}`}
              onClick={() => handleSetPageDisplayMode('single')}
              data-testid="pdf-page-mode-toggle-single"
            >
              한쪽보기
            </button>
          </div>
          <a className="document-viewer-link" href={documentUrl} target="_blank" rel="noreferrer">
            새 탭에서 열기
          </a>
        </div>
      </div>
      <div className={`document-viewer-frame-shell ${pageDisplayMode === 'spread' ? 'is-spread' : 'is-single'}`}>
        <div className={`document-viewer-spread ${pageDisplayMode === 'spread' ? 'is-spread' : 'is-single'}`}>
          <iframe
            className="workspace-document-frame"
            src={buildViewerUrl(leftPage)}
            title={`학습 자료 PDF ${leftPage}페이지`}
            loading="lazy"
          />
          {rightPage && (
            <iframe
              className="workspace-document-frame workspace-document-frame--secondary"
              src={buildViewerUrl(rightPage)}
              title={`학습 자료 PDF ${rightPage}페이지`}
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  )
}
