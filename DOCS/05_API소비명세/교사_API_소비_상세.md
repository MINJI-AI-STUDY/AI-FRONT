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
- `POST /api/teacher/channels/{channelId}/question-sets/generate`
- `GET /api/teacher/channels/{channelId}/question-sets`
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
- teacher channel workspace 모달(생성/검토/배포)
- 문제 검토 보조 화면(호환)
- 교사 대시보드
- teacher channel workspace
- teacher home channel cards

## 최근 반영 UI
- teacher channel workspace에서 생성/검토/배포를 모달 흐름으로 수행합니다.
- 생성 요청은 현재 채널 컨텍스트와 선택 materialId를 함께 전송합니다.
- 검토 모달에서 최종 확인 시 즉시 배포하며 dueAt 입력을 지원합니다.
