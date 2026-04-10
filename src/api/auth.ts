/**
 * 인증 API 서비스
 * F1: 로그인 및 역할 기반 진입 관련 API 함수
 */

import { post, get } from './client'

/**
 * 사용자 역할 타입
 */
export type Role = 'TEACHER' | 'STUDENT' | 'OPERATOR'

/**
 * 로그인 요청 타입
 * 백엔드: loginId, password
 */
export interface LoginRequest {
  loginId: string
  password: string
}

/**
 * 로그인 응답 타입
 * 백엔드: accessToken, role, displayName
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  role: Role
  displayName: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  role: Role
  displayName: string
}

/**
 * 현재 사용자 정보 응답 타입
 * 백엔드: userId, role, displayName
 */
export interface MeResponse {
  userId: string
  schoolId: string
  classroomId: string | null
  role: Role
  displayName: string
}

/**
 * 로그인 API
 * POST /api/auth/login
 * @param credentials - 로그인 자격 증명
 * @returns 로그인 응답 (accessToken, role, displayName)
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', credentials)
}

/**
 * 현재 사용자 정보 조회 API
 * GET /api/auth/me
 * @param token - 인증 토큰
 * @returns 현재 사용자 정보
 */
export async function getCurrentUser(token: string): Promise<MeResponse> {
  return get<MeResponse>('/api/auth/me', token)
}

export async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  return post<TokenResponse>('/api/auth/refresh', { refreshToken })
}

export async function logout(refreshToken: string): Promise<void> {
  return post<void>('/api/auth/logout', { refreshToken })
}
