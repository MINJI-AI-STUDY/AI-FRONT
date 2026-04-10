# Auth API 소비 상세

## POST /api/auth/login

### Request
```json
{
  "loginId": "teacher",
  "password": "teacher123"
}
```

### Response
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "role": "TEACHER",
  "displayName": "교사 데모"
}
```

## GET /api/auth/me

### 역할
- 토큰 복원 후 현재 사용자 컨텍스트를 가져온다.

## POST /api/auth/refresh
- access token 만료 시 refresh token으로 재발급을 시도한다.

## POST /api/auth/logout
- refresh token revoke 후 세션 스토리지를 비운다.
