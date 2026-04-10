# 가입/승인 API 소비 상세

## Signup
- `GET /api/signup/schools?keyword=`
- `POST /api/signup/teacher`
- `POST /api/signup/student`

## Approval
- `GET /api/signup/requests/pending?schoolId=`
- `PATCH /api/signup/requests/{signupRequestId}`

## 정책 반영
- 교직원은 학교 이메일 기반 가입 요청을 생성한다.
- 학생은 실명 기반 가입 요청을 생성한다.
- 운영자는 학교별 가입 요청을 승인/반려한다.
