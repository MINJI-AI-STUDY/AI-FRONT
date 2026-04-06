/**
 * 디자인 토큰 정의
 * Inflearn 스타일의 온라인 강의 플랫폼 UI를 기준으로 색상/간격/타이포를 재사용합니다.
 */

// 색상 토큰 - 차분한 블루 액센트로 변경
export const colors = {
  // 기본 색상 - 전문적인 블루 팔레트
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // 중립 색상 - 더 부드러운 그레이
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  // 시맨틱 색상
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  // 배경 색상
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    sidebar: '#1e293b',
    header: '#ffffff',
  },
} as const

// 시맨틱 토큰 별칭
export const semanticTokens = {
  surface: {
    page: colors.background.secondary,
    card: colors.background.primary,
    sidebar: colors.background.sidebar,
    header: colors.background.header,
    panel: '#ffffff',
    canvas: '#ffffff',
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    inverse: colors.neutral[50],
    muted: colors.neutral[400],
  },
  border: {
    default: colors.neutral[200],
    strong: colors.neutral[300],
    subtle: 'rgba(0, 0, 0, 0.06)',
  },
  action: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    ghost: 'rgba(255, 255, 255, 0.08)',
  },
} as const

// 간격 토큰 (4px 기준) - 더 정교한 간격
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
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
    sans: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Pretendard Mono", monospace',
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
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.25rem', // 20px
  full: '9999px',
} as const

// 그림자 토큰 - 더 절제된 그림자
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
  md: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.06)',
  xl: '0 8px 16px -4px rgba(0, 0, 0, 0.08)',
  '2xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  panel: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
  card: '0 2px 8px rgba(0, 0, 0, 0.04)',
  elevated: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
