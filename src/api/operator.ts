/**
 * 운영자 API 서비스
 * F5: 운영자 대시보드 관련 API 함수
 */

import { get } from './client'

export interface OperatorOverviewResponse {
  averageScore: number
  participationRate: number
  completionRate: number
}

/** 운영자 개요 조회 API */
export async function getOperatorOverview(token: string): Promise<OperatorOverviewResponse> {
  return get<OperatorOverviewResponse>('/api/operator/overview', token)
}
