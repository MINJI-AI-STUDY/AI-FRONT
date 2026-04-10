# Teacher API 소비 상세

## Material
- `POST /api/teacher/materials`
- `GET /api/teacher/materials`
- `GET /api/teacher/materials/{materialId}`
- `GET /api/teacher/materials/document/{materialId}`
- `POST /api/teacher/materials/{materialId}/retry`
- `GET /api/teacher/materials/{materialId}/dashboard`
- `GET /api/teacher/materials/{materialId}/qa-logs`
- `GET /api/teacher/materials/{materialId}/question-sets`

## Question
- `POST /api/teacher/materials/{materialId}/question-sets/generate`
- `GET /api/teacher/question-sets/{questionSetId}`
- `PATCH /api/teacher/question-sets/{questionSetId}/questions/{questionId}`
- `POST /api/teacher/question-sets/{questionSetId}/publish`
- `GET /api/teacher/question-sets/{questionSetId}/dashboard`

### 배포 요청 필드
- `dueAt` (선택): teacher 검토 화면에서 마감 일시를 입력해 함께 전송합니다.

## Channel
- `GET /api/teacher/channels`
- `POST /api/teacher/channels`
- `PATCH /api/teacher/channels/{channelId}`
- `GET /api/teacher/channels/{channelId}/workspace`
- `POST /api/channels/{channelId}/messages`
- `GET /api/channels/{channelId}/events?accessToken=`
- `POST /api/channels/{channelId}/presence/enter`
- `POST /api/channels/{channelId}/presence/heartbeat`
- `POST /api/channels/{channelId}/presence/leave`

## 주요 UI 연결
- teacher workspace
- 문제 검토 모달/화면
- 교사 대시보드
- teacher channel workspace
- teacher home channel cards

## 최근 반영 UI
- teacher home에 채널이 없을 때 첫 채널 생성 CTA를 제공합니다.
- question review 화면에서 due date 입력 후 배포할 수 있습니다.
