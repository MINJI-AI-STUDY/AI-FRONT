/**
 * 카드 컴포넌트
 * 디자인 토큰을 사용한 재사용 가능한 카드 컨테이너입니다.
 */

import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * 카드 컴포넌트
 * @param variant - 카드 스타일 변형
 * @param padding - 내부 패딩 크기
 * @param children - 카드 내용
 */
export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * 카드 헤더 컴포넌트
 */
export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * 카드 본문 컴포넌트
 */
export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * 카드 푸터 컴포넌트
 */
export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  )
}
