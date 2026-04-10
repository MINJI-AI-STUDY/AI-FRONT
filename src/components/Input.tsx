/**
 * 입력 필드 컴포넌트
 * 디자인 토큰을 사용한 재사용 가능한 입력 필드입니다.
 */

import type { InputHTMLAttributes } from 'react'
import { forwardRef, useId } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * 입력 필드 컴포넌트
 * @param label - 입력 필드 라벨
 * @param error - 에러 메시지
 * @param helperText - 도움말 텍스트
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="input-error-text">{error}</span>}
        {helperText && !error && (
          <span className="input-helper-text">{helperText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
