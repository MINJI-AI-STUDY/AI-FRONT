# 가입/승인 API 소비 상세

## Signup
- `GET /api/signup/schools?keyword=`
- `POST /api/signup/teacher`
- `POST /api/signup/student`
  - Request: `{ schoolId, studentCode, realName, pin, consentTerms, consentPrivacy, consentStudentNotice }`
  - 학생 코드는 학교에서 발급한 고유 식별자

## Approval
- `GET /api/signup/requests/pending?schoolId=`
- `PATCH /api/signup/requests/{signupRequestId}`

## 정책 반영
- 교직원은 학교 이메일 기반 가입 요청을 생성한다.
- 학생은 학생 코드 + 실명 기반 가입 요청을 생성한다.
  - 실명은 표시용이며, 로그인 식별자는 학생 코드이다.
- 운영자는 학교별 가입 요청을 승인/반려한다.
  - 학생 요청 목록에서 학생 코드를 표시하여 동명이인 구분
