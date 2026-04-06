/**
 * 디자인 토큰 정의
 * 학생이 먼저 쓰는 가벼운 UI를 기준으로 색상/간격/타이포를 재사용합니다.
 */

// 색상 토큰
export const colors = {
  // 기본 색상
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  // 중립 색상
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // 시맨틱 색상
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // 배경 색상
  background: {
    primary: '#ffffff',
    secondary: '#f3f4f6',
    sidebar: '#111827',
  },
} as const

// 시맨틱 토큰 별칭
export const semanticTokens = {
  surface: {
    page: colors.background.secondary,
    card: colors.background.primary,
    sidebar: colors.background.sidebar,
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    inverse: colors.neutral[50],
  },
  border: {
    default: colors.neutral[200],
    strong: colors.neutral[300],
  },
  action: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    ghost: 'rgba(255, 255, 255, 0.08)',
  },
} as const

// 간격 토큰 (4px 기준)
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
} as const

// 타이포그래피 토큰
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

// 테두리 반경 토큰
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

// 그림자 토큰
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const

// 전환 토큰
export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const

// 타입 정의
export type ColorToken = typeof colors
export type SemanticToken = typeof semanticTokens
export type SpacingToken = keyof typeof spacing
export type FontSizeToken = keyof typeof typography.fontSize
export type BorderRadiusToken = keyof typeof borderRadius
