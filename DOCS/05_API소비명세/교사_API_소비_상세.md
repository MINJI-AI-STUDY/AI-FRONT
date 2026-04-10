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
