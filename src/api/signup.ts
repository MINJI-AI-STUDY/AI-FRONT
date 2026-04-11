import { get, patch, post } from './client'

export interface SchoolMasterResponse {
  schoolId: string
  officialSchoolCode: string
  name: string
  schoolLevel: string
  region: string | null
  emailDomain: string | null
}

export interface CreateTeacherSignupRequest {
  schoolId: string
  displayName: string
  loginId: string
  password: string
  schoolEmail: string
  consentTerms: boolean
  consentPrivacy: boolean
  consentStudentNotice: boolean
}

export interface CreateStudentSignupRequest {
  schoolId: string
  classroomId?: string | null
  realName: string
  pin: string
  consentTerms: boolean
  consentPrivacy: boolean
  consentStudentNotice: boolean
}

export interface SignupRequestResponse {
  signupRequestId: string
  schoolId: string
  classroomId: string | null
  requesterName: string
  loginId: string | null
  role: 'TEACHER' | 'STUDENT'
  schoolEmail: string | null
  studentRealName: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  provisionedLoginId: string | null
  provisionedTempPassword: string | null
}

export interface ReviewSignupRequest {
  approve: boolean
  rejectionReason?: string | null
}

export async function searchSchools(keyword: string): Promise<SchoolMasterResponse[]> {
  return get<SchoolMasterResponse[]>(`/api/signup/schools?keyword=${encodeURIComponent(keyword)}`)
}

export async function createTeacherSignup(data: CreateTeacherSignupRequest): Promise<SignupRequestResponse> {
  return post<SignupRequestResponse>('/api/signup/teacher', data)
}

export async function createStudentSignup(data: CreateStudentSignupRequest): Promise<SignupRequestResponse> {
  return post<SignupRequestResponse>('/api/signup/student', data)
}

export async function getPendingSignupRequests(schoolId: string, token: string): Promise<SignupRequestResponse[]> {
  return get<SignupRequestResponse[]>(`/api/signup/requests/pending?schoolId=${encodeURIComponent(schoolId)}`, token)
}

export async function reviewSignupRequest(signupRequestId: string, data: ReviewSignupRequest, token: string): Promise<SignupRequestResponse> {
  return patch<SignupRequestResponse>(`/api/signup/requests/${signupRequestId}`, data, token)
}
