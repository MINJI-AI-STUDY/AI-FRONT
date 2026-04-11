# FRONT_RELEASE_GATE

## 1. 목적
이 문서는 AI-FRONT 저장소가 배포직전 완료로 판정되기 위한 프론트 전용 게이트를 정의한다.

## 2. 상위 기준 문서
- 루트 `DOCS/10_운영/RELEASE_GATE.md`
- 루트 `DOCS/00_기준/ONE_SHOT_DELIVERY_CONTRACT.md`
- `AI-FRONT/DOCS/00_기준/통합_개발_테스트_방법론.md`
- `AI-FRONT/DOCS/10_운영/FRONT_MANUAL_QA.md`
- 루트 `DOCS/10_운영/EVIDENCE_TEMPLATE.md`
- 루트 `DOCS/07_정책/ENV_SOURCE_OF_TRUTH.md`

## 3. 필수 명령
- lint: `npm run lint`
- build: `npm run build`
- 로컬 확인: `npm run dev -- --host 0.0.0.0 --port 4173`

## 4. 필수 게이트

### 4.1 빌드 게이트
- `npm run build`가 성공해야 한다.
- TypeScript 빌드와 Vite 번들이 모두 성공해야 한다.

### 4.2 라우팅 게이트
- 핵심 라우트 접근이 정상이어야 한다.
- 새로고침 시 SPA 라우팅이 깨지지 않아야 한다.

### 4.3 권한/보호 라우트 게이트
- teacher, student, operator 보호 라우트가 의도대로 동작해야 한다.
- 비인가 접근 시 차단 또는 적절한 안내가 표시되어야 한다.

### 4.4 UI smoke 게이트
아래 핵심 UI 흐름이 깨지지 않아야 한다.
- 로그인
- teacher 문서/문제 관련 화면
- student 풀이/결과/QA 화면
- operator 대시보드 화면
- operator 가입 승인 화면과 반려 사유 입력 흐름

### 4.5 API 연동 게이트
- 백엔드 API 실패 시 fallback UX가 있어야 한다.
- VITE_API_URL 기준 연결 주소가 명확해야 한다.

## 5. 배포 플랫폼 기준
- 운영 배포 플랫폼 기준은 Vercel이다.
- `AI-FRONT/vercel.json` 기준으로 SPA rewrite가 유지되어야 한다.

## 6. 필수 확인 항목
- [ ] lint 통과
- [ ] build 성공
- [ ] 핵심 라우팅 검증
- [ ] 권한/보호 라우트 검증
- [ ] 핵심 UI smoke 확인
- [ ] API 연동 실패 fallback 확인

## 7. 배포 차단 조건
- build 실패
- 보호 라우트 실패
- 핵심 화면 접근 불가
- VITE_API_URL 미확정
- 배포 도메인/CORS 연계 미정

## 8. 증거 기록
- 실행 명령
- build/lint 결과
- 핵심 화면 검증 결과
- 권한 라우트 검증 결과
- known issue

## 9. 실제 운영 입력 항목
- Vercel frontend URL:
- VITE_API_URL 실제 값:
- 보호 라우트 확인 계정:
- fallback 검증 시 backend URL:
- 배포 승인자:
