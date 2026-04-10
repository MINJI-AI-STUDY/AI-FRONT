/**
 * 학생 API 서비스
 * F4, F5, F6: 문제 풀이, 결과 확인, 질의응답 관련 API 함수
 */

import { get, post } from './client'

export interface StudentMaterialSummaryResponse {
  materialId: string
  docNo: number
  schoolId: string
  title: string
  description: string
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED'
  failureReason: string | null
}

export async function getStudentMaterials(token: string): Promise<StudentMaterialSummaryResponse[]> {
  return get<StudentMaterialSummaryResponse[]>('/api/student/materials', token)
}

export interface StudentQuestionResponse {
  id: string
  stem: string
  options: string[]
}

export interface StudentQuestionSetResponse {
  questionSetId: string
  materialId: string
  title: string
  dueAt: string | null
  questions: StudentQuestionResponse[]
}

/** 문제 세트 조회 API */
export async function getQuestionSet(
  distributionCode: string,
  token: string,
): Promise<StudentQuestionSetResponse> {
  return get<StudentQuestionSetResponse>(`/api/student/question-sets/${distributionCode}`, token)
}

export interface SubmitAnswerRequest {
  questionId: string
  selectedOptionIndex: number
}

export interface SubmitQuestionSetRequest {
  answers: SubmitAnswerRequest[]
}

export interface SubmissionAnswerResult {
  questionId: string
  selectedOptionIndex: number
  correct: boolean
  explanation: string
  conceptTags: string[]
}

export interface SubmissionResponse {
  submissionId: string
  score: number
  questionResults: SubmissionAnswerResult[]
}

/** 답안 제출 API */
export async function submitAnswers(
  distributionCode: string,
  data: SubmitQuestionSetRequest,
  token: string,
): Promise<SubmissionResponse> {
  return post<SubmissionResponse>(`/api/student/question-sets/${distributionCode}/submissions`, data, token)
}

export interface StudentResultResponse {
  score: number
  questionResults: SubmissionAnswerResult[]
  explanations: string[]
}

/** 결과 조회 API */
export async function getSubmissionResult(
  submissionId: string,
  token: string,
): Promise<StudentResultResponse> {
  return get<StudentResultResponse>(`/api/student/submissions/${submissionId}/result`, token)
}

// ==================== 질의응답 관련 타입 ====================

export interface QaResponse {
  answer: string
  evidenceSnippets: string[]
  grounded: boolean
  insufficientEvidence: boolean
}

export interface StudentQaLogResponse {
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

export interface AskQuestionRequest {
  question: string
}

/** 질의응답 API */
export async function askQuestion(
  materialId: string,
  data: AskQuestionRequest,
  token: string,
): Promise<QaResponse> {
  return post<QaResponse>(`/api/student/materials/${materialId}/qa`, data, token)
}

export async function getMyQaLogs(
  materialId: string,
  token: string,
): Promise<StudentQaLogResponse[]> {
  return get<StudentQaLogResponse[]>(`/api/student/materials/${materialId}/qa-logs/me`, token)
}

export interface ChannelResponse {
  channelId: string
  schoolId: string
  name: string
  description: string | null
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
  materials: StudentMaterialSummaryResponse[]
  recentMessages: ChannelMessageResponse[]
  participants: ChannelParticipantResponse[]
}

export async function getStudentChannels(token: string): Promise<ChannelResponse[]> {
  return get<ChannelResponse[]>('/api/student/channels', token)
}

export async function getStudentChannelWorkspace(channelId: string, token: string): Promise<ChannelWorkspaceResponse> {
  return get<ChannelWorkspaceResponse>(`/api/student/channels/${channelId}/workspace`, token)
}

export async function sendChannelMessage(channelId: string, content: string, token: string): Promise<ChannelMessageResponse> {
  return post<ChannelMessageResponse>(`/api/channels/${channelId}/messages`, { content }, token)
}
