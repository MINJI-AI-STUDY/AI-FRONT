/**
 * 운영자 API 서비스
 * F5: 운영자 대시보드 관련 API 함수
 */

import { get, patch, post } from './client'

export interface OperatorOverviewResponse {
  averageScore: number
  participationRate: number
  completionRate: number
}

export interface SchoolResponse {
  schoolId: string
  name: string
  active: boolean
}

export interface ClassroomResponse {
  classroomId: string
  schoolId: string
  name: string
  grade: number | null
}

export interface AdminUserResponse {
  userId: string
  schoolId: string
  classroomId: string | null
  loginId: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
  active: boolean
}

export interface CreateSchoolRequest { name: string }
export interface UpdateSchoolRequest { name: string; active: boolean }
export interface CreateClassroomRequest { name: string; grade: number | null }
export interface UpdateClassroomRequest { name: string; grade: number | null }
export interface CreateAdminUserRequest {
  schoolId: string
  classroomId: string | null
  loginId: string
  password: string
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
}
export interface UpdateAdminUserRequest {
  schoolId: string
  classroomId: string | null
  displayName: string
  role: 'TEACHER' | 'STUDENT' | 'OPERATOR'
  active: boolean
  password?: string
}

/** 운영자 개요 조회 API */
export async function getOperatorOverview(token: string): Promise<OperatorOverviewResponse> {
  return get<OperatorOverviewResponse>('/api/operator/overview', token)
}

export async function getSchools(token: string): Promise<SchoolResponse[]> {
  return get<SchoolResponse[]>('/api/operator/schools', token)
}

export async function getClassrooms(schoolId: string, token: string): Promise<ClassroomResponse[]> {
  return get<ClassroomResponse[]>(`/api/operator/schools/${schoolId}/classrooms`, token)
}

export async function getAdminUsers(token: string, schoolId?: string): Promise<AdminUserResponse[]> {
  const query = schoolId ? `?schoolId=${encodeURIComponent(schoolId)}` : ''
  return get<AdminUserResponse[]>(`/api/operator/users${query}`, token)
}

export async function createSchool(data: CreateSchoolRequest, token: string): Promise<SchoolResponse> {
  return post<SchoolResponse>('/api/operator/schools', data, token)
}

export async function updateSchool(schoolId: string, data: UpdateSchoolRequest, token: string): Promise<SchoolResponse> {
  return patch<SchoolResponse>(`/api/operator/schools/${schoolId}`, data, token)
}

export async function createClassroom(schoolId: string, data: CreateClassroomRequest, token: string): Promise<ClassroomResponse> {
  return post<ClassroomResponse>(`/api/operator/schools/${schoolId}/classrooms`, data, token)
}

export async function updateClassroom(classroomId: string, data: UpdateClassroomRequest, token: string): Promise<ClassroomResponse> {
  return patch<ClassroomResponse>(`/api/operator/classrooms/${classroomId}`, data, token)
}

export async function createAdminUser(data: CreateAdminUserRequest, token: string): Promise<AdminUserResponse> {
  return post<AdminUserResponse>('/api/operator/users', data, token)
}

export async function updateAdminUser(userId: string, data: UpdateAdminUserRequest, token: string): Promise<AdminUserResponse> {
  return patch<AdminUserResponse>(`/api/operator/users/${userId}`, data, token)
}
