/**
 * Canonical workspace responsive breakpoint constants.
 *
 * Single source of truth for all viewport thresholds used by
 * workspace shell logic, CSS custom properties, and media queries.
 *
 * CSS custom properties are injected by useWorkspaceShell so that
 * CSS media queries can stay in sync with JS logic without duplication.
 */

/** Viewport at or below this value is "compact" (tablet/mobile). */
export const COMPACT_VIEWPORT_MAX = 1180

/** Minimum width considered a tablet viewport. */
export const TABLET_MIN = 768

/** Maximum width considered a mobile viewport. */
export const MOBILE_MAX = 767

/**
 * Minimum available width (px) for the right panel to render inline
 * alongside the main content. Below this threshold the right panel
 * must switch to overlay mode so the main content stays readable.
 */
export const READABLE_PDF_MIN_WIDTH = 600

/**
 * Default PDF page display mode when viewport is wide enough for
 * two-page spread. Falls back to single-page when width is below
 * READABLE_PDF_MIN_WIDTH.
 */
export const DEFAULT_PAGE_DISPLAY_MODE = 'spread' as const

/**
 * CSS custom property names injected by the workspace shell.
 * CSS files should reference these via `var(--workspace-compact-max)` etc.
 */
export const WORKSPACE_CSS_VARS = {
  compactMax: '--workspace-compact-max',
  tabletMin: '--workspace-tablet-min',
  mobileMax: '--workspace-mobile-max',
  readablePdfMin: '--workspace-readable-pdf-min',
} as const
