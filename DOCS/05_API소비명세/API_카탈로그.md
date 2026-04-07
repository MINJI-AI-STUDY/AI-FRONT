# 프론트 API 소비 카탈로그

| 도메인 | 메서드 | URL | 설명 |
| --- | --- | --- | --- |
| auth | POST | `/api/auth/login` | 로그인 |
| auth | GET | `/api/auth/me` | 사용자 복원 |
| material | POST | `/api/teacher/materials` | 자료 업로드 |
| material | GET | `/api/teacher/materials/{materialId}` | 자료 상태 조회 |
| material | GET | `/api/teacher/materials/document/{materialId}` | PDF 조회 |
| question | POST | `/api/teacher/materials/{materialId}/question-sets/generate` | 문제 생성 |
| submission | POST | `/api/student/question-sets/{distributionCode}/submissions` | 학생 제출 |
| dashboard | GET | `/api/operator/overview` | 운영자 overview |
| qa | POST | `/api/student/materials/{materialId}/qa` | 자료 기반 QA |
