/**
 * 자료 PDF 뷰어 컴포넌트
 * 인증 토큰으로 PDF를 받아 화면에 렌더링합니다.
 *
 * 브라우저 기본 PDF 뷰어 한계를 고려해 단일 페이지 네비게이션만 제공합니다.
 */

import { useCallback, useEffect, useState } from "react";

interface MaterialDocumentViewerProps {
  materialId: string;
  token: string;
}

type NavigationAction = "next" | "previous";

function canNavigateForward(
  currentPage: number,
  totalPages: number | null
): boolean {
  if (totalPages == null) {
    return true;
  }

  return currentPage + 1 <= totalPages;
}

function getNextPage(
  currentPage: number,
  totalPages: number | null
): number {
  if (totalPages == null) {
    return currentPage + 1;
  }

  return Math.min(currentPage + 1, totalPages);
}

function getPreviousPage(currentPage: number): number {
  return Math.max(1, currentPage - 1);
}

function getPageLabel(page: number): string {
  return `${page} 페이지`;
}

function getPageTransitionAction(
  page: number,
  action: NavigationAction,
  totalPages: number | null
): number {
  if (action === "previous") {
    return getPreviousPage(page);
  }

  return getNextPage(page, totalPages);
}

/** Decompress a single FlateDecode stream using the browser DecompressionStream API.
 *  Returns the decompressed bytes, or null on failure.
 */
async function decompressZlib(raw: Uint8Array): Promise<Uint8Array | null> {
  try {
    if (typeof DecompressionStream === 'undefined') {
      return null
    }

    const algorithms: Array<'deflate-raw' | 'deflate'> = ['deflate-raw', 'deflate']
    for (const algorithm of algorithms) {
      try {
        const safeRaw = new Uint8Array(raw)
        const decompressed = await new Response(
          new Blob([safeRaw]).stream().pipeThrough(new DecompressionStream(algorithm)),
        ).arrayBuffer()
        return new Uint8Array(decompressed)
      } catch {
        // try next algorithm
      }
    }

    return null
  } catch {
    return null
  }
}

/** Extract page count from a PDF blob.
 *  Strategy:
 *  1. Search raw bytes for /Count <n> (works for uncompressed PDFs).
 *  2. If not found, locate FlateDecode stream sections, decompress each, and search for /Count <n>.
 *  3. As a final fallback, count /Type /Page (not /Pages) objects across raw + decompressed content.
 *  Returns the best page count estimate, or null if indeterminate.
 */
async function extractPdfPageCount(blob: Blob): Promise<number | null> {
  try {
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('latin1').decode(bytes)

    // --- Strategy 1: /Count in raw bytes ---
    let maxCount = 0
    for (const match of text.matchAll(/\/Count\s+(\d+)/g)) {
      const n = parseInt(match[1], 10)
      if (n > maxCount) {
        maxCount = n
      }
    }
    if (maxCount > 0) {
      return maxCount
    }

    // --- Strategy 2: Decompress FlateDecode streams and search for /Count ---
    const streamRegex = /stream\r?\n/g
    const endstreamRegex = /\r?\nendstream/g
    const flateDecodeRegex = /\/Filter\s*\/FlateDecode/

    // Collect stream byte ranges that have FlateDecode filter
    const streamRanges: { start: number; end: number }[] = []
    let sMatch: RegExpExecArray | null
    while (true) {
      sMatch = streamRegex.exec(text)
      if (sMatch == null) {
        break
      }

      const streamStart = sMatch.index + sMatch[0].length
      // Check if the preceding object dictionary mentions FlateDecode
      const lookback = text.lastIndexOf('obj', sMatch.index)
      const header = lookback >= 0 ? text.slice(lookback, sMatch.index) : ''
      if (!flateDecodeRegex.test(header)) {
        // Not a FlateDecode stream — skip but also search raw content for /Type /Page
        continue
      }
      // Find endstream
      endstreamRegex.lastIndex = streamStart
      const eMatch = endstreamRegex.exec(text)
      if (!eMatch) continue
      // Stream content ends before the newline preceding endstream
      const streamEnd = eMatch.index
      streamRanges.push({ start: streamStart, end: streamEnd })
    }

    // Decompress each FlateDecode stream and search for /Count
    for (const range of streamRanges) {
      const raw = bytes.slice(range.start, range.end)
      const decompressed = await decompressZlib(raw)
      if (!decompressed) continue
      const decText = new TextDecoder('latin1', { fatal: false }).decode(decompressed)
      for (const match of decText.matchAll(/\/Count\s+(\d+)/g)) {
        const n = parseInt(match[1], 10)
        if (n > maxCount) {
          maxCount = n
        }
      }
    }
    if (maxCount > 0) {
      return maxCount
    }

    // --- Strategy 3: Count /Type /Page objects (not /Pages) ---
    let pageCount = 0
    // Count in raw text
    pageCount += Array.from(text.matchAll(/\/Type\s*\/Page\b(?!s)/g)).length
    // Count in decompressed streams
    for (const range of streamRanges) {
      const raw = bytes.slice(range.start, range.end)
      const decompressed = await decompressZlib(raw)
      if (!decompressed) continue
      const decText = new TextDecoder('latin1', { fatal: false }).decode(decompressed)
      pageCount += Array.from(decText.matchAll(/\/Type\s*\/Page\b(?!s)/g)).length
    }
    return pageCount > 0 ? pageCount : null
  } catch {
    return null
  }
}

export function MaterialDocumentViewer({
  materialId,
  token,
}: MaterialDocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [navigating, setNavigating] = useState(false);
  const canGoToNextPage = canNavigateForward(currentPage, totalPages);
  const pageStatusLabel =
    totalPages == null
      ? "총 페이지 수 미확인: 마지막 페이지 도달 여부는 정확히 보장되지 않습니다."
      : `총 ${totalPages}페이지`;
  const pageIndicator = getPageLabel(currentPage);

  const handlePageChange = useCallback(
    (action: NavigationAction) => {
      setNavigating(true);
      setCurrentPage((current) => {
        const nextPage = getPageTransitionAction(current, action, totalPages);

        if (action === "next" && !canNavigateForward(current, totalPages)) {
          return current;
        }

        return Math.max(1, nextPage);
      });
      // Reset navigating flag after render commits the page change.
      requestAnimationFrame(() => setNavigating(false));
    },
    [totalPages]
  );

  const handlePrevious = useCallback(() => {
    handlePageChange("previous");
  }, [handlePageChange]);

  const handleNext = useCallback(() => {
    handlePageChange("next");
  }, [handlePageChange]);

  // currentPage should stay within known bounds (when known).
  useEffect(() => {
    if (totalPages == null) {
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const buildViewerUrl = (page: number) =>
    `${documentUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${page}&view=FitH`;
  const viewerSrc = buildViewerUrl(currentPage)

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchDocument = async () => {
      setCurrentPage(1);
      setTotalPages(null);
      setNavigating(false);
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL ?? "http://localhost:8080"}/api/materials/document/${materialId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`문서 조회 실패: ${response.status}`);
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setDocumentUrl(objectUrl);
        // Extract page count from PDF bytes.
        const pageCount = await extractPdfPageCount(blob);
        setTotalPages(pageCount);
      } catch (err) {
        console.error("문서 로딩 실패:", err);
        setError("문서를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [materialId, token]);

  if (loading) {
    return <div className="workspace-document-placeholder">문서를 불러오는 중...</div>;
  }

  if (error || !documentUrl) {
    return (
      <div className="workspace-document-placeholder error">
        {error ?? "문서를 찾을 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="document-viewer-shell workspace-document-stage" data-testid="pdf-shell">
      <div className="document-viewer-toolbar">
        <div className="document-viewer-toolbar-title">
          <strong>학습 문서</strong>
          <span className="document-viewer-helper">
            브라우저 PDF 뷰어 한계로 단일 페이지 기준의 정직한 네비게이션만 제공합니다.
          </span>
          <span className="document-viewer-helper">{pageStatusLabel}</span>
        </div>
        <div className="document-viewer-toolbar-actions">
          <div className="document-viewer-page-controls">
            <button
              type="button"
              className="document-viewer-nav-button"
              onClick={handlePrevious}
              disabled={currentPage <= 1 || navigating}
            >
              이전 페이지
            </button>
            <span className="document-viewer-page-indicator">{pageIndicator}</span>
            <button
              type="button"
              className="document-viewer-nav-button"
              onClick={handleNext}
              disabled={!canGoToNextPage || navigating}
              title={
                totalPages == null
                  ? "총 페이지 미확인 상태에서는 마지막 페이지에서의 정확한 잠금이 제한됩니다."
                  : undefined
              }
            >
              다음 페이지
            </button>
          </div>
          <a className="document-viewer-link" href={documentUrl} target="_blank" rel="noreferrer">
            새 탭에서 열기
          </a>
        </div>
      </div>
      <div className="document-viewer-frame-shell is-single">
        <div className="document-viewer-spread is-single">
          <iframe
            key={`${materialId}-${currentPage}`}
            className="workspace-document-frame"
            src={viewerSrc}
            title={`학습 자료 PDF ${currentPage}페이지`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
