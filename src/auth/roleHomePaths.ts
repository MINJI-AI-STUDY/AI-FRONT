import type { Role } from '../api/auth'

export const roleHomePaths: Record<Role, string> = {
  TEACHER: '/teacher',
  STUDENT: '/student',
  OPERATOR: '/operator',
}
