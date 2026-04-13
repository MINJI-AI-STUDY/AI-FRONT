/**
 * 자료 PDF 뷰어 컴포넌트
 * 인증 토큰으로 PDF를 받아 화면에 렌더링합니다.
 *
 * 뷰포트 너비에 따라 한쪽/두쪽 보기 모드를 자동 전환합니다.
 * 사용자가 수동으로 모드를 선택한 경우 뷰포트가 허용하는 한 그 선택을 존중합니다.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceShell } from "../hooks/useWorkspaceShell";
import type { PageDisplayMode } from "../hooks/useWorkspaceShell";

interface MaterialDocumentViewerProps {
  materialId: string;
  token: string;
}

type NavigationAction = "next" | "previous";

function getPageStep(mode: PageDisplayMode): number {
  return mode === "spread" ? 2 : 1;
}

function canSelectSpreadMode(defaultMode: PageDisplayMode): boolean {
  return defaultMode === "spread";
}

function resolvePageDisplayMode(params: {
  defaultMode: PageDisplayMode;
  userMode: PageDisplayMode | null;
}): {
  canSpread: boolean;
  mode: PageDisplayMode;
  reason: string;
} {
  if (!canSelectSpreadMode(params.defaultMode)) {
    return {
      canSpread: false,
      mode: "single",
      reason: "뷰포트가 좁아 두쪽보기가 불가하므로 단일 페이지 모드로 강제 적용됩니다.",
    };
  }

  if (params.userMode == null) {
    return {
      canSpread: true,
      mode: "spread",
      reason: "뷰포트 기본값 기준으로 두쪽보기가 유지됩니다.",
    };
  }

  return {
    canSpread: true,
    mode: params.userMode,
    reason:
      params.userMode === "spread"
        ? "사용자가 두쪽보기를 선택했습니다."
        : "사용자가 한쪽보기를 선택했습니다.",
  };
}

function getSpreadRightPage(
  currentPage: number,
  totalPages: number | null
): number {
  if (totalPages == null) {
    return currentPage + 1;
  }

  return Math.min(currentPage + 1, totalPages);
}

function canNavigateForward(
  currentPage: number,
  mode: PageDisplayMode,
  totalPages: number | null
): boolean {
  if (totalPages == null) {
    return true;
  }

  return currentPage + getPageStep(mode) <= totalPages;
}

function getNextPage(
  currentPage: number,
  mode: PageDisplayMode,
  totalPages: number | null
): number {
  if (totalPages == null) {
    return currentPage + getPageStep(mode);
  }

  return Math.min(currentPage + getPageStep(mode), totalPages);
}

function getPreviousPage(currentPage: number, mode: PageDisplayMode): number {
  return Math.max(1, currentPage - getPageStep(mode));
}

function getPageRangeLabel(
  leftPage: number,
  rightPage: number | null,
  mode: PageDisplayMode
): string {
  if (mode === "single" || rightPage == null || rightPage === leftPage) {
    return `${leftPage} 페이지`;
  }

  return `${leftPage}-${rightPage} 페이지`;
}

function getPageTransitionAction(
  page: number,
  action: NavigationAction,
  mode: PageDisplayMode,
  totalPages: number | null
): number {
  if (action === "previous") {
    return getPreviousPage(page, mode);
  }

  return getNextPage(page, mode, totalPages);
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

  const { defaultPageDisplayMode } = useWorkspaceShell();

  // Track whether the user has explicitly chosen a mode (vs viewport-driven default).
  const [userSelectedMode, setUserSelectedMode] = useState<PageDisplayMode | null>(null);
  const previousDefaultPageDisplayMode = useRef<PageDisplayMode>(defaultPageDisplayMode);

  const pageMode = useMemo(
    () =>
      resolvePageDisplayMode({
        defaultMode: defaultPageDisplayMode,
        userMode: userSelectedMode,
      }),
    [defaultPageDisplayMode, userSelectedMode]
  );

  const hasEnoughPagesForSpread = totalPages == null || totalPages > 1;
  const canSpread = pageMode.canSpread && hasEnoughPagesForSpread;
  const pageDisplayMode: PageDisplayMode = canSpread ? pageMode.mode : "single";
  const dualDisabledReason = !pageMode.canSpread
    ? "뷰포트가 좁아 두쪽보기를 사용할 수 없습니다"
    : !hasEnoughPagesForSpread
      ? "페이지가 1장이라 두쪽보기를 사용할 수 없습니다"
      : null;
  const pageModeReason =
    !hasEnoughPagesForSpread && pageMode.canSpread
      ? "페이지가 1장이라 한쪽보기로 고정됩니다."
      : pageMode.reason;

  // Reset user choice when viewport forced single mode started or ended.
  // This keeps "manual single" choices honest as viewport-first fallback.
  useEffect(() => {
    const changedFrom = previousDefaultPageDisplayMode.current;
    const changedTo = defaultPageDisplayMode;

    if (
      (changedTo === "single" && changedFrom === "spread") ||
      (changedTo === "spread" && changedFrom === "single")
    ) {
      setUserSelectedMode(null);
    }

    previousDefaultPageDisplayMode.current = changedTo;
  }, [defaultPageDisplayMode]);

  const handleSetPageDisplayMode = useCallback(
    (mode: PageDisplayMode) => {
      if (!canSpread && mode === "spread") {
        return;
      }

      setUserSelectedMode(mode);
    },
    [canSpread]
  );

  const canGoToNextPage = canNavigateForward(currentPage, pageDisplayMode, totalPages);
  const leftPage = currentPage;
  const rightPage =
    pageDisplayMode === "spread" ? getSpreadRightPage(currentPage, totalPages) : null;
  const pageStatusLabel =
    totalPages == null
      ? "총 페이지 수 미확인: 마지막 페이지 도달 여부는 정확히 보장되지 않습니다."
      : `총 ${totalPages}페이지`;
  const pageIndicator = getPageRangeLabel(leftPage, rightPage, pageDisplayMode);

  const handlePageChange = useCallback(
    (action: NavigationAction) => {
      setNavigating(true);
      setCurrentPage((current) => {
        const nextPage = getPageTransitionAction(current, action, pageDisplayMode, totalPages);

        if (action === "next" && !canNavigateForward(current, pageDisplayMode, totalPages)) {
          return current;
        }

        return Math.max(1, nextPage);
      });
      // Reset navigating flag after render commits the page change.
      requestAnimationFrame(() => setNavigating(false));
    },
    [pageDisplayMode, totalPages]
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

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchDocument = async () => {
      setCurrentPage(1);
      setTotalPages(null);
      setNavigating(false);
      setUserSelectedMode(null);
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
            브라우저 PDF 뷰어 한계로 강제 양면 제어는 제공하지 않고, 상태 규칙 기반으로 페이지
            이동을 제어합니다.
          </span>
          <span className="document-viewer-helper" data-testid="viewer-mode-indicator">
            {pageModeReason}
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
          <div className="document-viewer-mode-group" data-testid="pdf-page-mode-toggle">
            {dualDisabledReason && (
              <span
                className="document-viewer-mode-disabled-reason"
                data-testid="viewer-dual-disabled-reason"
              >
                {dualDisabledReason}
              </span>
            )}
            <button
              type="button"
              className={`document-viewer-mode-chip ${pageDisplayMode === "spread" ? "active" : ""}`}
              onClick={() => handleSetPageDisplayMode("spread")}
              disabled={!canSpread}
              data-testid="viewer-dual-toggle"
            >
              두쪽보기 우선
            </button>
            <button
              type="button"
              className={`document-viewer-mode-chip ${pageDisplayMode === "single" ? "active" : ""}`}
              onClick={() => handleSetPageDisplayMode("single")}
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
      <div
        className={`document-viewer-frame-shell ${pageDisplayMode === "spread" ? "is-spread" : "is-single"}`}
      >
        <div
          className={`document-viewer-spread ${pageDisplayMode === "spread" ? "is-spread" : "is-single"}`}
        >
          <iframe
            className="workspace-document-frame"
            src={buildViewerUrl(leftPage)}
            title={`학습 자료 PDF ${leftPage}페이지`}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
