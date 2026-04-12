# Student API 소비 상세

## Materials
- `GET /api/student/materials`
- 같은 학교에서 READY 상태인 자료를 학생 홈에 자동 노출한다.
- `GET /api/materials/document/{materialId}`
- 학생 workspace / QA / channel workspace는 공통 인증 PDF inline 조회 경로를 사용한다.

## Channel
- `GET /api/student/channels`
- `GET /api/student/channels/{channelId}/workspace`
- `GET /api/student/channels/{channelId}/active-question-set`
- `GET /api/student/materials/{materialId}/active-question-set`
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
- student channel workspace (공식 메인 학습 단위)
- student question-set workspace (집중 풀이)
- 결과 화면
- QA 화면
- student channel workspace
- student home channel cards

## 최근 반영 UI
- student channel workspace의 활성 문제 세트 조회는 channel 우선 경로를 사용합니다.
- material 기반 활성 문제 세트 경로는 호환 fallback으로 유지합니다.
