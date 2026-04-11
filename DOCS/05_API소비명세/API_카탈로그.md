# 프론트 API 소비 카탈로그

| 도메인 | 메서드 | URL | 설명 |
| --- | --- | --- | --- |
| auth | POST | `/api/auth/login` | 로그인 |
| auth | POST | `/api/auth/student/login` | 학생 PIN 로그인 |
| auth | GET | `/api/auth/me` | 사용자 복원 |
| auth | POST | `/api/auth/refresh` | 토큰 재발급 |
| auth | POST | `/api/auth/logout` | 로그아웃 |
| material | POST | `/api/teacher/materials` | 자료 업로드 |
| material | GET | `/api/teacher/materials` | 교사 자료 목록 |
| material | GET | `/api/teacher/materials/{materialId}` | 자료 상태 조회 |
| material | GET | `/api/teacher/materials/document/{materialId}` | PDF 조회 |
| material | GET | `/api/student/materials` | 학생 자료 목록 |
| question | POST | `/api/teacher/materials/{materialId}/question-sets/generate` | 문제 생성 |
| question | GET | `/api/teacher/materials/{materialId}/question-sets` | 자료별 문제 세트 목록 |
| submission | POST | `/api/student/question-sets/{distributionCode}/submissions` | 학생 제출 |
| submission | GET | `/api/student/question-sets/{distributionCode}` | 학생 문제 조회 |
| submission | GET | `/api/student/submissions/{submissionId}/result` | 학생 결과 조회 |
| dashboard | GET | `/api/teacher/question-sets/{questionSetId}/dashboard` | 교사 대시보드 |
| dashboard | GET | `/api/teacher/materials/{materialId}/dashboard` | 문서 대시보드 |
| dashboard | GET | `/api/operator/overview` | 운영자 overview |
| qa | POST | `/api/student/materials/{materialId}/qa` | 자료 기반 QA |
| qa | GET | `/api/student/materials/{materialId}/qa-logs/me` | 질문 이력 |
| qa | GET | `/api/teacher/materials/{materialId}/qa-logs` | 교사 질문 로그 |
| channel | GET | `/api/teacher/channels` | 교사 채널 목록 |
| channel | POST | `/api/teacher/channels` | 교사 채널 생성 |
| channel | PATCH | `/api/teacher/channels/{channelId}` | 교사 채널 수정 |
| channel | GET | `/api/student/channels` | 학생 채널 목록 |
| channel | GET | `/api/teacher/channels/{channelId}/workspace` | 교사 채널 워크스페이스 |
| channel | GET | `/api/student/channels/{channelId}/workspace` | 학생 채널 워크스페이스 |
| channel | GET | `/api/channels/{channelId}/events?accessToken=` | SSE 채널 이벤트 |
| channel | POST | `/api/channels/{channelId}/presence/enter` | 채널 입장 |
| channel | POST | `/api/channels/{channelId}/presence/heartbeat` | 채널 heartbeat |
| channel | POST | `/api/channels/{channelId}/presence/leave` | 채널 퇴장 |
| channel | POST | `/api/channels/{channelId}/messages` | 채널 메시지 전송 |
