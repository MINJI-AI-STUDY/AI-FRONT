/**
 * 교사 API 서비스
 * F2: 자료 업로드, 상태 조회, 재시도 관련 API 함수
 */

import { get, post } from './client'

/** 자료 상태 타입 */
export type MaterialStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'

/** 자료 요약 응답 타입 */
export interface MaterialSummaryResponse {
  materialId: string
  title: string
  description: string
  status: MaterialStatus
  failureReason: string | null
}

/** 자료 업로드 요청 타입 */
export interface UploadMaterialRequest {
  title: string
  description?: string
}

/**
 * 자료 업로드 API
 */
export async function uploadMaterial(
  file: File,
  data: UploadMaterialRequest,
  token: string,
): Promise<MaterialSummaryResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', data.title)
  if (data.description) {
    formData.append('description', data.description)
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/api/teacher/materials`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(`자료 업로드 실패: ${response.status}`)
  }

  return response.json()
}

/**
 * 자료 상태 조회 API
 */
export async function getMaterial(
  materialId: string,
  token: string,
): Promise<MaterialSummaryResponse> {
  return get<MaterialSummaryResponse>(`/api/teacher/materials/${materialId}`, token)
}

/**
 * 자료 재시도 API
 */
export async function retryMaterial(
  materialId: string,
  token: string,
): Promise<MaterialSummaryResponse> {
  return post<MaterialSummaryResponse>(`/api/teacher/materials/${materialId}/retry`, undefined, token)
}
