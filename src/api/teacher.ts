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
  docNo: number
  schoolId: string
  title: string
  description: string
  status: MaterialStatus
  failureReason: string | null
}

/** 자료 업로드 요청 타입 */
export interface UploadMaterialRequest {
  channelId?: string
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
  if (data.channelId) {
    formData.append('channelId', data.channelId)
  }
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

export async function getMaterials(token: string): Promise<MaterialSummaryResponse[]> {
  return get<MaterialSummaryResponse[]>('/api/teacher/materials', token)
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

export interface DocumentQuestionSetSummary {
  questionSetId: string
  status: 'REVIEW_REQUIRED' | 'PUBLISHED' | 'CLOSED'
  distributionCode: string | null
  dueAt: string | null
  questionCount: number
  createdAt: string
}

export interface TeacherQaLogResponse {
  qaLogId: string
  materialId: string
  studentId: string
  question: string
  answer: string
  grounded: boolean
  status: string
  createdAt: string
  evidenceSnippets: string[]
}

export interface DocumentDashboardResponse {
  material: MaterialSummaryResponse
  questionSetCount: number
  questionCount: number
  submissionCount: number
  participantCount: number
  averageScore: number
  qaCount: number
  generatedQuestionSets: DocumentQuestionSetSummary[]
  recentQaLogs: TeacherQaLogResponse[]
}

export async function getDocumentDashboard(
  materialId: string,
  token: string,
): Promise<DocumentDashboardResponse> {
  return get<DocumentDashboardResponse>(`/api/teacher/materials/${materialId}/dashboard`, token)
}

export async function getTeacherQaLogs(
  materialId: string,
  token: string,
): Promise<TeacherQaLogResponse[]> {
  return get<TeacherQaLogResponse[]>(`/api/teacher/materials/${materialId}/qa-logs`, token)
}

export async function getQuestionSetsByMaterial(
  materialId: string,
  token: string,
): Promise<QuestionSetResponse[]> {
  return get<QuestionSetResponse[]>(`/api/teacher/materials/${materialId}/question-sets`, token)
}

export interface ChannelResponse {
  channelId: string
  schoolId: string
  name: string
  description: string | null
  sortOrder: number
  active: boolean
}

export interface CreateChannelRequest {
  name: string
  description?: string
  sortOrder: number
}

export interface UpdateChannelRequest {
  name: string
  description?: string
  sortOrder: number
  active: boolean
}

export interface ChannelParticipantResponse {
  userId: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
}

export interface ChannelMessageResponse {
  messageId: string
  userId: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
  content: string
  createdAt: string
}

export interface ChannelWorkspaceResponse {
  channel: ChannelResponse
  materials: MaterialSummaryResponse[]
  recentMessages: ChannelMessageResponse[]
  participants: ChannelParticipantResponse[]
}

export async function getTeacherChannels(token: string): Promise<ChannelResponse[]> {
  return get<ChannelResponse[]>('/api/teacher/channels', token)
}

export async function createChannel(data: CreateChannelRequest, token: string): Promise<ChannelResponse> {
  return post<ChannelResponse>('/api/teacher/channels', data, token)
}

export async function updateChannel(channelId: string, data: UpdateChannelRequest, token: string): Promise<ChannelResponse> {
  return patch<ChannelResponse>(`/api/teacher/channels/${channelId}`, data, token)
}

export async function getTeacherChannelWorkspace(channelId: string, token: string): Promise<ChannelWorkspaceResponse> {
  return get<ChannelWorkspaceResponse>(`/api/teacher/channels/${channelId}/workspace`, token)
}

export async function sendChannelMessage(channelId: string, content: string, token: string): Promise<ChannelMessageResponse> {
  return post<ChannelMessageResponse>(`/api/channels/${channelId}/messages`, { content }, token)
}
