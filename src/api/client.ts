/**
 * API 클라이언트
 * 환경변수 기반 API URL을 사용하는 HTTP 클라이언트입니다.
 */

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/$/, '')
}

function resolveApiBaseUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

  if (configuredApiUrl) {
    return normalizeApiBaseUrl(configuredApiUrl)
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

    if (isLocalhost) {
      return 'http://localhost:8080'
    }
  }

  // VITE_API_URL이 설정되지 않은 프로덕션 환경에서는
  // window.origin으로 폴백하지 않음 (Vercel 등에서 프론트엔드 자신을 가리키게 됨)
  console.error(
    'VITE_API_URL이 설정되지 않았습니다. API 서버 URL을 환경변수로 설정하세요.'
  )
  return ''
}

// API 기본 URL (환경변수 필수, 미설정 시 빈 문자열 → 요청 실패로 명시적 에러 노출)
const API_BASE_URL = resolveApiBaseUrl()

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * 요청 옵션 타입
 */
interface RequestOptions extends RequestInit {
  token?: string
}

/**
 * API 요청 함수
 * @param endpoint - API 엔드포인트 경로
 * @param options - 요청 옵션
 * @returns 응답 데이터
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  // 응답이 성공적이지 않으면 에러 발생
  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      // JSON 파싱 실패 시 무시
    }

    throw new ApiError(
      response.status,
      `API 요청 실패: ${response.status} ${response.statusText}`,
      errorData
    )
  }

  // 응답 본문이 없으면 null 반환
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    return null as T
  }

  return response.json()
}

/**
 * GET 요청
 */
export function get<T>(endpoint: string, token?: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET', token })
}

/**
 * POST 요청
 */
export function post<T>(
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    token,
  })
}

/**
 * PATCH 요청
 */
export function patch<T>(
  endpoint: string,
  data?: unknown,
  token?: string,
): Promise<T> {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    token,
  })
}

// API 기본 URL 낵�
export { API_BASE_URL }
