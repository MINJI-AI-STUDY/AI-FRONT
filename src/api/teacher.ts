/**
 * 교사 API 서비스
 * F2: 자료 업로드, 상태 조회, 재시도 관련 API 함수
 */

import { get, post, patch } from './client'

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

// ==================== 문제 세트 관련 타입 ====================

export interface QuestionResponse {
  id: string
  stem: string
  options: string[]
  correctOptionIndex: number
  explanation: string
  conceptTags: string[]
  excluded: boolean
}

export interface QuestionSetResponse {
  questionSetId: string
  status: 'REVIEW_REQUIRED' | 'PUBLISHED' | 'CLOSED'
  materialId: string
  distributionCode: string | null
  distributionLink: string | null
  dueAt: string | null
  questions: QuestionResponse[]
}

export interface GenerateQuestionsRequest {
  questionCount: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

/** 문제 생성 API */
export async function generateQuestions(
  materialId: string,
  data: GenerateQuestionsRequest,
  token: string,
): Promise<QuestionSetResponse> {
  return post<QuestionSetResponse>(
    `/api/teacher/materials/${materialId}/question-sets/generate`,
    data,
    token,
  )
}

/** 문제 세트 단건 조회 API */
export async function getQuestionSetById(
  questionSetId: string,
  token: string,
): Promise<QuestionSetResponse> {
  return get<QuestionSetResponse>(`/api/teacher/question-sets/${questionSetId}`, token)
}

export interface UpdateQuestionRequest {
  stem: string
  options: [string, string, string, string]
  correctOptionIndex: number
  explanation: string
  conceptTags: [string] | [string, string]
  excluded: boolean
}

/** 문제 수정 API */
export async function updateQuestion(
  questionSetId: string,
  questionId: string,
  data: UpdateQuestionRequest,
  token: string,
): Promise<QuestionSetResponse> {
  return patch<QuestionSetResponse>(
    `/api/teacher/question-sets/${questionSetId}/questions/${questionId}`,
    data,
    token,
  )
}

export interface PublishQuestionSetRequest {
  dueAt?: string
}

/** 문제 세트 배포 API */
export async function publishQuestionSet(
  questionSetId: string,
  token: string,
  request?: PublishQuestionSetRequest,
): Promise<QuestionSetResponse> {
  return post<QuestionSetResponse>(`/api/teacher/question-sets/${questionSetId}/publish`, request, token)
}

// ==================== 대시보드 관련 타입 ====================

export interface TeacherStudentScore {
  studentId: string
  score: number
}

export interface QuestionAccuracy {
  questionId: string
  accuracyRate: number
}

export interface WeakConceptTag {
  tag: string
  count: number
}

export interface TeacherDashboardResponse {
  studentScores: TeacherStudentScore[]
  questionAccuracy: QuestionAccuracy[]
  weakConceptTags: WeakConceptTag[]
}

/** 교사 대시보드 조회 API */
export async function getTeacherDashboard(
  questionSetId: string,
  token: string,
): Promise<TeacherDashboardResponse> {
  return get<TeacherDashboardResponse>(`/api/teacher/question-sets/${questionSetId}/dashboard`, token)
}
