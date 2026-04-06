/**
 * 모달 컴포넌트
 * 재사용 가능한 다이얼로그/모달 패턴입니다.
 * 오버레이, 닫기 기능, 애니메이션을 포함합니다.
 */

import type { ReactNode, MouseEvent } from 'react'
import { useEffect, useCallback } from 'react'
import './Modal.css'

interface ModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean
  /** 모달 닫기 핸들러 */
  onClose: () => void
  /** 모달 제목 */
  title?: string
  /** 모달 콘텐츠 */
  children: ReactNode
  /** 푸터 영역 */
  footer?: ReactNode
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean
  /** 오버레이 클릭으로 닫기 허용 */
  closeOnOverlayClick?: boolean
  /** ESC 키로 닫기 허용 */
  closeOnEsc?: boolean
  /** 모달 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * 모달 컴포넌트
 * @param isOpen - 모달 표시 여부
 * @param onClose - 모달 닫기 핸들러
 * @param title - 모달 제목
 * @param children - 모달 콘텐츠
 * @param footer - 푸터 영역
 * @param showCloseButton - 닫기 버튼 표시 여부
 * @param closeOnOverlayClick - 오버레이 클릭으로 닫기
 * @param closeOnEsc - ESC 키로 닫기
 * @param size - 모달 크기
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = 'md',
}: ModalProps) {
  // ESC 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEsc, onClose]
  )

  // ESC 키 이벤트 리스너 등록
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // 오버레이 클릭 핸들러
  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`modal-container modal-${size}`}>
        <div className="modal-header">
          {title && (
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="닫기"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  /** 확인 모달 메시지 */
  message: string
  /** 확인 버튼 텍스트 */
  confirmText?: string
  /** 취소 버튼 텍스트 */
  cancelText?: string
  /** 확인 버튼 변형 */
  confirmVariant?: 'primary' | 'danger'
  /** 확인 버튼 로딩 상태 */
  loading?: boolean
  /** 확인 핸들러 */
  onConfirm: () => void
}

/**
 * 확인 모달 컴포넌트
 * 확인/취소 버튼이 포함된 모달입니다.
 */
export function ConfirmModal({
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  ...modalProps
}: ConfirmModalProps) {
  const footer = (
    <>
      <button
        className="btn btn-outline"
        onClick={modalProps.onClose}
        disabled={loading}
        type="button"
      >
        {cancelText}
      </button>
      <button
        className={`btn btn-${confirmVariant} ${loading ? 'btn-loading' : ''}`}
        onClick={onConfirm}
        disabled={loading}
        type="button"
      >
        {confirmText}
      </button>
    </>
  )

  return (
    <Modal {...modalProps} footer={footer}>
      <p className="modal-message">{message}</p>
    </Modal>
  )
}
