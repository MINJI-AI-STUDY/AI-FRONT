import { useCallback, useEffect, useState } from 'react'
import {
  COMPACT_VIEWPORT_MAX,
  READABLE_PDF_MIN_WIDTH,
  TABLET_MIN,
  WORKSPACE_CSS_VARS,
  DEFAULT_PAGE_DISPLAY_MODE,
} from '../constants/workspaceBreakpoints'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

export type PanelMode = 'inline' | 'overlay'

export type PageDisplayMode = 'single' | 'spread'

export interface WorkspaceShellState {
  /** Current viewport classification. */
  viewportMode: ViewportMode
  /** True when viewport width ≤ COMPACT_VIEWPORT_MAX. */
  isCompactViewport: boolean
  /** Left sidebar should render as an overlay (tablet/mobile). */
  leftPanelMode: PanelMode
  /** Right panel should render as overlay when viewport is too narrow for inline. */
  rightPanelMode: PanelMode
  /** Whether the right panel can be shown inline given current width. */
  canRightPanelInline: boolean
  /** Default PDF page display mode based on readability threshold. */
  defaultPageDisplayMode: PageDisplayMode
}

export interface WorkspaceShellActions {
  /** Toggle left sidebar; enforces overlay exclusivity on compact viewports. */
  toggleLeftSidebar: (nextOpen: boolean) => void
  /** Toggle right panel; enforces overlay exclusivity on compact viewports. */
  toggleRightPanel: (nextOpen: boolean) => void
}

export interface UseWorkspaceShellOptions {
  /** Initial left sidebar open state (default: !isCompactViewport). */
  initialLeftOpen?: boolean
  /** Initial right panel open state (default: false — always closed). */
  initialRightOpen?: boolean
}

export interface WorkspaceShellReturn extends WorkspaceShellState {
  leftSidebarOpen: boolean
  rightPanelOpen: boolean
  setLeftSidebarOpen: (open: boolean) => void
  setRightPanelOpen: (open: boolean) => void
  toggleLeftSidebar: (nextOpen: boolean) => void
  toggleRightPanel: (nextOpen: boolean) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getViewportMode(width: number): ViewportMode {
  if (width <= 767) return 'mobile'
  if (width <= COMPACT_VIEWPORT_MAX) return 'tablet'
  return 'desktop'
}

function getIsCompact(width: number): boolean {
  return width <= COMPACT_VIEWPORT_MAX
}

function getCanRightPanelInline(width: number): boolean {
  // When the viewport is compact, the right panel shares space with main.
  // It can be inline only if the remaining width after the panel is still readable.
  // On desktop (> COMPACT_VIEWPORT_MAX) there is always enough room.
  return width > COMPACT_VIEWPORT_MAX || width >= READABLE_PDF_MIN_WIDTH + 320
}

function getDefaultPageDisplayMode(width: number): PageDisplayMode {
  if (width < READABLE_PDF_MIN_WIDTH) return 'single'
  return DEFAULT_PAGE_DISPLAY_MODE
}

/**
 * Inject CSS custom properties on <html> so CSS media queries can
 * reference the same breakpoint values without hardcoding.
 */
function injectCssVars() {
  const root = document.documentElement
  root.style.setProperty(WORKSPACE_CSS_VARS.compactMax, `${COMPACT_VIEWPORT_MAX}px`)
  root.style.setProperty(WORKSPACE_CSS_VARS.tabletMin, `${TABLET_MIN}px`)
  root.style.setProperty(WORKSPACE_CSS_VARS.mobileMax, '767px')
  root.style.setProperty(WORKSPACE_CSS_VARS.readablePdfMin, `${READABLE_PDF_MIN_WIDTH}px`)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Shared responsive state machine for workspace shell layout.
 *
 * Computes viewport mode, panel modes, overlay exclusivity, and
 * PDF readability defaults from a single source of truth.
 *
 * - Right panel defaults to CLOSED on fresh entry.
 * - On compact viewports, opening one overlay panel closes the other.
 * - PDF defaults to two-page (spread) with readability fallback.
 */
export function useWorkspaceShell(
  options: UseWorkspaceShellOptions = {},
): WorkspaceShellReturn {
  const { initialLeftOpen, initialRightOpen = false } = options

  // --- Viewport state --------------------------------------------------

  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1920,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${COMPACT_VIEWPORT_MAX}px)`)

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    // Also listen to the compact breakpoint specifically for faster response
    handleResize()
    mql.addEventListener('change', handleResize)
    window.addEventListener('resize', handleResize)

    // Inject CSS custom properties once
    injectCssVars()

    return () => {
      mql.removeEventListener('change', handleResize)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // --- Derived viewport state ------------------------------------------

  const isCompactViewport = getIsCompact(viewportWidth)
  const viewportMode = getViewportMode(viewportWidth)
  const canRightPanelInline = getCanRightPanelInline(viewportWidth)
  const rightPanelMode: PanelMode = canRightPanelInline ? 'inline' : 'overlay'
  const leftPanelMode: PanelMode = isCompactViewport ? 'overlay' : 'inline'
  const defaultPageDisplayMode = getDefaultPageDisplayMode(viewportWidth)

  // --- Panel open state ------------------------------------------------

  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(
    () => initialLeftOpen ?? !getIsCompact(typeof window !== 'undefined' ? window.innerWidth : 1920),
  )
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(initialRightOpen)

  // Sync left sidebar with compact viewport changes (uncontrolled mode)
  useEffect(() => {
    if (initialLeftOpen !== undefined) return // controlled by caller
    setLeftSidebarOpen(!isCompactViewport)
  }, [isCompactViewport, initialLeftOpen])

  // --- Overlay exclusivity ---------------------------------------------

  const toggleLeftSidebar = useCallback(
    (nextOpen: boolean) => {
      setLeftSidebarOpen(nextOpen)
      if (nextOpen && isCompactViewport) {
        // Opening left overlay → close right overlay
        setRightPanelOpen(false)
      }
    },
    [isCompactViewport],
  )

  const toggleRightPanel = useCallback(
    (nextOpen: boolean) => {
      setRightPanelOpen(nextOpen)
      if (nextOpen && isCompactViewport) {
        // Opening right overlay → close left overlay
        setLeftSidebarOpen(false)
      }
    },
    [isCompactViewport],
  )

  // --- Return ----------------------------------------------------------

  return {
    viewportMode,
    isCompactViewport,
    leftPanelMode,
    rightPanelMode,
    canRightPanelInline,
    defaultPageDisplayMode,
    leftSidebarOpen,
    rightPanelOpen,
    setLeftSidebarOpen,
    setRightPanelOpen,
    toggleLeftSidebar,
    toggleRightPanel,
  }
}
