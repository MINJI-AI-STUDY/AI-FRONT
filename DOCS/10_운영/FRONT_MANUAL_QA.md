# FRONT_MANUAL_QA

## 1. 목적
이 문서는 AI-FRONT의 핵심 UI와 역할 기반 접근 흐름을 수동 검증하기 위한 기준을 정의한다.

## 관련 문서
- 공통 수동 QA: `../../../DOCS/10_운영/MANUAL_QA_MATRIX.md`
- 프론트 게이트: `FRONT_RELEASE_GATE.md`
- 증거 템플릿: `../../../DOCS/10_운영/EVIDENCE_TEMPLATE.md`
- env 단일 원천: `../../../DOCS/07_정책/ENV_SOURCE_OF_TRUTH.md`

## 2. 우선 시나리오
- teacher 로그인 후 자료/문제 흐름 진입
- student 로그인 후 풀이/결과/QA 흐름 진입
- operator 로그인 후 가입 승인/반려와 허용 범위만 조회
- 보호 라우트 직접 접근 차단
- API 실패 시 에러/빈 상태 UX 확인

## 3. 시나리오 템플릿
- 시나리오명:
- 역할:
- URL:
- 사전 조건:
- 기대 결과:
- 실제 결과:
- 판정:
- 증거:

## 4. 최소 배포 차단 시나리오
- 로그인/라우팅 실패
- 역할별 홈/워크스페이스 진입 실패
- 제출/결과/QA 화면 핵심 렌더 실패
- 비인가 접근 차단 실패
- 운영자 가입 승인/반려 흐름 실패

## 5. 실제 QA 입력
- frontend URL:
- backend URL:
- teacher 계정:
- student 계정:
- operator 계정:
- 테스트 브라우저:
- 수행자:
