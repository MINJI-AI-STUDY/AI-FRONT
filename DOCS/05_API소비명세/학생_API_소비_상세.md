# Student API 소비 상세

## Materials
- `GET /api/student/materials`
- 같은 학교에서 READY 상태인 자료를 학생 홈에 자동 노출한다.
- `GET /api/materials/document/{materialId}`
- 학생 workspace / QA / channel workspace는 공통 인증 PDF inline 조회 경로를 사용한다.

## Channel
- `GET /api/student/channels`
- `GET /api/student/channels/{channelId}/workspace`
- `POST /api/channels/{channelId}/messages`
- `GET /api/channels/{channelId}/events?accessToken=`
- `POST /api/channels/{channelId}/presence/enter`
- `POST /api/channels/{channelId}/presence/heartbeat`
- `POST /api/channels/{channelId}/presence/leave`

## Submission
- `GET /api/student/question-sets/{distributionCode}`
- `POST /api/student/question-sets/{distributionCode}/submissions`
- `GET /api/student/submissions/{submissionId}/result`

## QA
- `POST /api/student/materials/{materialId}/qa`
- `GET /api/student/materials/{materialId}/qa-logs/me`

## 주요 UI 연결
- student workspace
- 결과 화면
- QA 화면
- student channel workspace
- student home channel cards
