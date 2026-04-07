# Teacher API 소비 상세

## Material
- `POST /api/teacher/materials`
- `GET /api/teacher/materials/{materialId}`
- `GET /api/teacher/materials/document/{materialId}`
- `POST /api/teacher/materials/{materialId}/retry`

## Question
- `POST /api/teacher/materials/{materialId}/question-sets/generate`
- `GET /api/teacher/question-sets/{questionSetId}`
- `PATCH /api/teacher/question-sets/{questionSetId}/questions/{questionId}`
- `POST /api/teacher/question-sets/{questionSetId}/publish`
- `GET /api/teacher/question-sets/{questionSetId}/dashboard`

## 주요 UI 연결
- teacher workspace
- 문제 검토 모달/화면
- 교사 대시보드
