# Student API 소비 상세

## Materials
- `GET /api/student/materials`
- 같은 학교에서 READY 상태인 자료를 학생 홈에 자동 노출한다.

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
