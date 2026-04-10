# API 프론트 1대1 매핑 체크리스트

## 백엔드 API 계약 요약

### 인증 (Auth)
- `POST /api/auth/login`: `{ loginId, password }` → `{ accessToken, refreshToken, role, displayName }`
- `POST /api/auth/refresh`: `{ refreshToken }` → `{ accessToken, refreshToken, role, displayName }`
- `POST /api/auth/logout`: `{ refreshToken }` → `204/200 empty`
- `GET /api/auth/me`: Authorization header → `{ userId, schoolId, classroomId, role, displayName }`

### 자료 (Material)
- `POST /api/teacher/materials`: multipart/form-data `{ file, channelId, title, description }` → `{ materialId, docNo, schoolId, channelId, title, description, status, failureReason }`
- `GET /api/teacher/materials`: → `MaterialSummaryResponse[]`
- `GET /api/teacher/materials/{materialId}`: → `{ materialId, docNo, schoolId, title, description, status, failureReason }`
- `GET /api/student/materials`: → `MaterialSummaryResponse[]`
- `POST /api/teacher/materials/{materialId}/retry`: → `{ materialId, docNo, schoolId, title, description, status, failureReason }`

### 문제 세트 (Question Set)
- `POST /api/teacher/materials/{materialId}/question-sets/generate`: `{ questionCount, difficulty }` → `{ questionSetId, status, materialId, distributionCode, distributionLink, dueAt, questions[] }`
- `PATCH /api/teacher/question-sets/{questionSetId}/questions/{questionId}`: `{ stem, options, correctOptionIndex, explanation, conceptTags, excluded }` → `QuestionSetResponse`
- `POST /api/teacher/question-sets/{questionSetId}/publish`: `{ dueAt? }` → `QuestionSetResponse`

### 학생 제출 (Student Submission)
- `GET /api/student/question-sets/{distributionCode}`: Authorization header → `{ questionSetId, title, dueAt, questions[{ id, stem, options }] }`
- `POST /api/student/question-sets/{distributionCode}/submissions`: `{ answers[{ questionId, selectedOptionIndex }] }` → `{ submissionId, score, questionResults[] }`
- `GET /api/student/submissions/{submissionId}/result`: → `{ score, questionResults[], explanations[] }`

### 질의응답 (QA)
- `POST /api/student/materials/{materialId}/qa`: `{ question }` → `{ answer, evidenceSnippets[], grounded, insufficientEvidence }`
- `GET /api/student/materials/{materialId}/qa-logs/me`: → `StudentQaLogResponse[]`

### 채널 (Channel)
- `GET /api/teacher/channels`
- `GET /api/student/channels`
- `POST /api/teacher/channels`
- `PATCH /api/teacher/channels/{channelId}`
- `GET /api/teacher/channels/{channelId}/workspace`
- `GET /api/student/channels/{channelId}/workspace`
- `GET /api/channels/{channelId}/events?accessToken=`
- `POST /api/channels/{channelId}/presence/enter`
- `POST /api/channels/{channelId}/presence/heartbeat`
- `POST /api/channels/{channelId}/presence/leave`
- `POST /api/channels/{channelId}/messages`

### 대시보드 (Dashboard)
- `GET /api/teacher/question-sets/{questionSetId}/dashboard`: → `{ studentScores[{ studentId, score }], questionAccuracy[{ questionId, accuracyRate }], weakConceptTags[{ tag, count }] }`
- `GET /api/operator/overview`: → `{ averageScore, participationRate, completionRate }`

## 구현 상태

| 기능 | 프론트 경로 | 백엔드 API | 상태 | 비고 |
|---|---|---|---|---|
| F1 로그인 | `/login` | `POST /api/auth/login` | 완료 | accessToken + refreshToken |
| F1 토큰 재발급 | 앱 초기화 | `POST /api/auth/refresh` | 완료 | 401 시 refresh token 사용 |
| F1 로그아웃 | 전역 | `POST /api/auth/logout` | 완료 | refresh token revoke |
| F1 현재 사용자 | 앱 초기화 | `GET /api/auth/me` | 완료 | userId, schoolId, classroomId |
| F2 업로드 | `/teacher/materials/new` | `POST /api/teacher/materials` | 완료 | multipart/form-data |
| F2 교사 목록 | `/teacher` | `GET /api/teacher/materials` | 완료 | 업로드 자료 재진입 |
| F2 학생 자료 자동 노출 | `/student` | `GET /api/student/materials` | 완료 | 같은 학교 READY 자료 노출 |
| F2 상태조회 | `/teacher/materials/:materialId` | `GET /api/teacher/materials/{materialId}` | 완료 | materialId (string) |
| F2 재시도 | `/teacher/materials/:materialId` | `POST /api/teacher/materials/{materialId}/retry` | 완료 | |
| F3 생성 | 교사 생성 액션 | `POST /api/teacher/materials/{materialId}/question-sets/generate` | 완료 | questionSetId (string) |
| F3 수정 | 교사 검토 화면 | `PATCH /api/teacher/question-sets/{questionSetId}/questions/{questionId}` | 완료 | 모든 필드 필수 + 실제 수정 UI 반영 |
| F3 배포 | 교사 검토 화면 | `POST /api/teacher/question-sets/{questionSetId}/publish` | 완료 | dueAt 선택적 |
| F4 문제조회 | `/student/question-sets/:distributionCode` | `GET /api/student/question-sets/{distributionCode}` | 완료 | Authorization 필수 |
| F4 제출 | `/student/question-sets/:distributionCode` | `POST /api/student/question-sets/{distributionCode}/submissions` | 완료 | answers[{ questionId, selectedOptionIndex }] |
| F5 학생 결과 | `/student/submissions/:submissionId` | `GET /api/student/submissions/{submissionId}/result` | 완료 | submissionId (string) |
| F5 교사 대시보드 | `/teacher/question-sets/:questionSetId/dashboard` | `GET /api/teacher/question-sets/{questionSetId}/dashboard` | 완료 | studentScores, questionAccuracy, weakConceptTags |
| F5 운영자 대시보드 | `/operator` | `GET /api/operator/overview` | 완료 | averageScore, participationRate, completionRate |
| F6 질의응답 | `/student/materials/:materialId/qa` | `POST /api/student/materials/{materialId}/qa` | 완료 | evidenceSnippets (string[]) |

## 주요 변경사항 (백엔드 계약 정렬)

### 인증
- `username` → `loginId`
- `token` → `accessToken`
- `refreshToken` 추가
- `user.id` → `userId` (string)
- `user.name` → `displayName`

### 자료
- `id` → `materialId` (string)
- `docNo`, `schoolId` 추가
- `createdAt`, `updatedAt` 제거됨
- `failureReason` 추가됨

### 문제 세트
- `id` → `questionSetId` (string)
- `correctIndex` → `correctOptionIndex`
- `distributionLink`, `dueAt` 추가됨
- 모든 ID가 string으로 변경
- 검토 화면은 단건 조회 `GET /api/teacher/question-sets/{questionSetId}` 후 수정 저장을 수행

### 학생 제출
- `answers: number[]` → `answers: [{ questionId, selectedOptionIndex }]`
- `submissionId`가 string으로 변경
- `questionResults`에 `correct`, `explanation`, `conceptTags` 포함

### 질의응답
- `evidence: [{ content, source }]` → `evidenceSnippets: string[]`
- `hasEvidence` → `grounded`
- `insufficientEvidence` 추가됨

### 대시보드
- 교사: `studentScores`, `questionAccuracy`, `weakConceptTags` 구조 변경
- 운영자: `averageScore`, `participationRate`, `completionRate`만 반환

## 구현 완료 항목

### 디자인 시스템
- [x] 디자인 토큰 정의 (tokens/index.ts)
- [x] 공통 컴포넌트 (Button, Input, Card, Layout)

### 인증
- [x] 로그인 페이지 (LoginPage)
- [x] 인증 컨텍스트 (auth/context.tsx)
- [x] 보호된 라우트 (auth/ProtectedRoute.tsx)
- [x] 역할 기반 접근 제어

### 교사 화면
- [x] 교사 홈 (TeacherHomePage)
- [x] 자료 업로드 (MaterialUploadPage)
- [x] 자료 상태 (MaterialStatusPage)
- [x] 문제 생성 (QuestionGeneratePage)
- [x] 문제 검토 (QuestionReviewPage)
- [x] 교사 대시보드 (TeacherDashboardPage)

### 학생 화면
- [x] 학생 홈 (StudentHomePage)
- [x] 배포 코드 입력 (JoinPage)
- [x] 문제 풀이 (QuestionSetPage)
- [x] 결과 확인 (SubmissionResultPage)
- [x] 질의응답 (QAPage)

### 운영자 화면
- [x] 운영자 대시보드 (OperatorOverviewPage)

### API 서비스
- [x] 인증 API (api/auth.ts)
- [x] 교사 API (api/teacher.ts)
- [x] 학생 API (api/student.ts)
- [x] 운영자 API (api/operator.ts)

## 주의사항
- 모든 API 호출은 환경변수 `VITE_API_URL`을 통해 백엔드 URL 설정
- 인증 토큰은 sessionStorage에 저장
- 역할 기반 라우트 가드 적용 (TEACHER, STUDENT, OPERATOR)
- 모든 ID는 string 타입
- PATCH 요청은 모든 필드가 필수

## 수동 QA 근거
- 학생: 데모 로그인 후 `ACBF15` 코드로 문제 세트 참여, 제출, 결과 페이지 진입 확인
- 교사: 데모 로그인 후 PDF 업로드, READY 상태 확인, 문제 생성, 배포 코드 발급 확인
- 운영자: 데모 로그인 후 `/operator`에서 실제 API 데이터 표시 확인
