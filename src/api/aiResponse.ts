/**
 * AI 응답 상태 분류 및 사용자 메시지 정규화
 *
 * 백엔드 계약(grounded, insufficientEvidence)을 기반으로
 * 학생 AI 표면 전체에서 동일한 3-state 의미론을 사용하도록 한다.
 *
 * 상태:
 * 1. grounded        — 정상 근거 응답
 * 2. insufficientEvidence — 자료 근거 부족
 * 3. runtimeFailure  — 런타임/연결 실패
 */

import type { QaResponse } from './student'

// ── 상태 분류 ──────────────────────────────────────────────

export type AiResponseState = 'grounded' | 'insufficientEvidence' | 'runtimeFailure'

export function classifyAiResponse(response: QaResponse): AiResponseState {
  if (response.insufficientEvidence) return 'insufficientEvidence'
  if (response.grounded) return 'grounded'
  return 'runtimeFailure'
}

// ── 사용자 대면 메시지 ─────────────────────────────────────

export const AI_RESPONSE_MESSAGES: Record<AiResponseState, {
  badge: string
  description: string
  action: string
}> = {
  grounded: {
    badge: '자료 근거 응답',
    description: '자료를 기반으로 작성된 답변입니다.',
    action: '',
  },
  insufficientEvidence: {
    badge: '근거 부족 안내',
    description: '이 답변은 자료에서 직접적인 근거를 찾을 수 없습니다.',
    action: '질문을 더 구체화하거나 다른 자료를 선택해 보세요.',
  },
  runtimeFailure: {
    badge: 'AI 처리 실패',
    description: 'AI 서버 연결 또는 처리에 실패했습니다.',
    action: '잠시 후 다시 시도해주세요.',
  },
}

// ── 에러 분류 (fetch/ApiError) ──────────────────────────────

export type ErrorKind = 'network' | 'server' | 'unknown'

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof TypeError) {
    // fetch 자체가 실패한 경우 (네트워크 오류, CORS, DNS 등)
    return 'network'
  }
  if (error && typeof error === 'object' && 'status' in error) {
    return 'server'
  }
  return 'unknown'
}

export function getUserFacingErrorMessage(error: unknown): string {
  const kind = classifyError(error)

  if (kind === 'network') {
    return '서버에 연결할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
  }

  if (kind === 'server') {
    const status = (error as { status: number }).status
    if (status === 401 || status === 403) {
      return '로그인이 필요합니다.'
    }
    if (status === 404) {
      return '요청한 자료를 찾을 수 없습니다.'
    }
    if (status >= 500) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
    return '요청을 처리하는데 실패했습니다.'
  }

  return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'
}