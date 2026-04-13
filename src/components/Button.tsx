/**
 * 버튼 컴포넌트
 * 디자인 토큰을 사용한 재사용 가능한 버튼입니다.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

// 버튼 변형 타입
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

/**
 * 버튼 컴포넌트
 * @param variant - 버튼 스타일 변형
 * @param size - 버튼 크기
 * @param loading - 로딩 상태
 * @param children - 버튼 내용
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="btn-spinner" />}
      <span className={`btn-content ${loading ? 'is-loading' : ''}`}>{children}</span>
    </button>
  )
}
