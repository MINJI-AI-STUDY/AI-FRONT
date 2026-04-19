# FRONT_MANUAL_QA

## 1. 목적
AI-FRONT의 핵심 UI와 역할 기반 접근 흐름을 수동 검증하기 위한 기준이다.

## 2. 관련 문서
- 공통 수동 QA: `../../../DOCS/10_운영/MANUAL_QA_MATRIX.md`
- 프론트 게이트: `FRONT_RELEASE_GATE.md`
- 증거 템플릿: `../../../DOCS/10_운영/EVIDENCE_TEMPLATE.md`
- env 단일 원천: `../../../DOCS/07_정책/ENV_SOURCE_OF_TRUTH.md`

## 3. 우선 시나리오
- teacher 로그인 후 자료/문제 흐름 진입
- student 로그인 후 풀이/결과/QA 흐름 진입
- operator 로그인 후 가입 승인/반려와 허용 범위만 조회
- 보호 라우트 직접 접근 차단
- API 실패 시 에러/빈 상태 UX 확인
- tablet/mobile에서 PDF-first shell과 drawer/overlay nav 동작 확인

## 4. 이번 변경 기준 필수 시나리오

### 4.1 teacher 채널 워크스페이스
- URL: `/teacher/channels/:channelId`
- 사전 조건:
  - 교사 계정 로그인 완료
  - 채널 1개 이상 존재
  - 채널에 PDF 1개 이상 연결
  - 최근 메시지 1개 이상 또는 빈 상태 확인 가능
- 절차:
  1. teacher 채널 워크스페이스 진입
  2. 좌측 채널 목록이 기본 고정이 아니라 overlay drawer로 열리는지 확인
  3. 첫 진입에서 중앙 PDF가 가장 큰 시각 요소인지 확인
  4. 우측 패널이 기본 닫힘 상태에서 필요 시 열리고, `채널 관리 / 현재 PDF / 채널 최근 메시지 / 문제 흐름`이 contextual sheet/drawer로 분리 노출되는지 확인
  5. tablet/mobile first load에서 좌측 nav와 우측 패널이 PDF를 가리지 않는지 확인
  6. `PDF 업로드`, `새 채널 생성`, `문제 생성`, `최근 검토 열기` 버튼 라벨이 잘리지 않고 compact header 안에 과밀하지 않은지 확인
  7. PDF viewer가 단일 페이지 네비게이션만 노출하고, 양면 보기 토글이 남아 있지 않은지 확인
- 기대 결과:
  - 좌측은 탐색, 우측은 운영/보조작업 역할이 명확하다.
  - teacher workspace는 persistent side-column layout이 아니다.
  - PDF viewer helper/chrome가 과도하게 보이지 않는다.
  - 우측 최근 메시지가 channel-wide 흐름만 보여준다.
  - PDF affordance는 단일 페이지 네비게이션 범위만 설명한다.

### 4.2 teacher 보조패널 CTA / 대시보드 흐름
- URL: `/teacher` → `/teacher/materials/:materialId/dashboard` → `/teacher/materials/:materialId/workspace`
- 사전 조건:
  - 교사 계정 로그인 완료
  - 미리보기 카드와 문서 대시보드 진입 대상 문서 1개 이상 존재
- 절차:
  1. 홈에서 `대시보드 미리보기`와 `문서 대시보드 열기`가 분리되어 보이는지 확인한다.
  2. 미리보기에서 현재 문서 요약이 보이고, 상세 진입 CTA가 과밀하지 않은지 확인한다.
  3. 상세 대시보드에서 `현재 문서 → 문제세트 이동 → 최근 질문 흐름` 순서가 읽히는지 확인한다.
  4. `문서 대시보드` 또는 `워크스페이스로 이동` CTA를 통해 채널 워크스페이스로 자연스럽게 이어지는지 확인한다.
  5. CTA 문구가 영어/깨짐 없이 한국어로 노출되는지 확인한다.
- 기대 결과:
  - 홈 → 미리보기 → 상세 → 워크스페이스 흐름이 한 번에 설명된다.
  - 보조패널 CTA는 다음 행동만 제안하고 역할을 넘지 않는다.

### 4.3 viewer / sidebar 상호작용
- URL: teacher/student workspace 공통
- 절차:
  1. `다음` 버튼이 마지막 페이지에서는 disabled 되는지 확인한다.
  2. `두쪽보기`/`한쪽보기` 토글이 노출되지 않는지 확인한다.
  3. 페이지 이동이 항상 한 페이지씩만 진행되는지 확인한다.
  4. 좌측 sidebar와 우측 패널은 화면 가장자리의 중간 핸들로 진입/닫기가 가능한지 확인한다.
  5. 기본 진입은 핸들 중심 UX이며, overlay 상태에서는 backdrop/close 버튼으로 닫아도 동작이 모순되지 않는지 확인한다.
- 기대 결과:
  - 마지막 페이지에서 더 이상 진행되지 않는다.
  - PDF viewer는 항상 단일 페이지 네비게이션만 제공한다.
  - 좌우 패널은 콘텐츠를 가리지 않으며, 기본 진입은 핸들 중심으로 유지된다.

### 4.4 student 채널 워크스페이스 AI/채팅
- URL: `/student/channels/:channelId`
- 사전 조건:
  - 학생 계정 로그인 완료
  - 채널에 PDF 1개 이상 연결
  - AI 질의응답 가능 상태
- 절차:
  1. student 채널 워크스페이스 진입
  2. 우측 패널에서 `AI 도우미` 탭 선택
  3. 질문 1건 전송
  4. 답변에서 `핵심 답변`이 먼저 보이는지 확인
  5. `전체 답변 보기`와 `근거 보기`가 기본 접힘 상태인지 확인
  6. `채널 대화` 탭으로 전환 후 메시지 송수신 확인
  7. tablet/mobile에서 우측 패널이 기본 닫힘/drawer로 동작하고 PDF를 가리지 않는지 확인
  8. 질문 입력과 답변 확인이 우측 패널 안에서 끝나는지 확인
  9. question workspace에서는 중앙 문서 아래 카드가 기본 노출되지 않는지 확인
- 기대 결과:
  - AI 답변은 짧은 핵심 요약 우선 구조다.
  - 근거/evidence는 기본적으로 펼쳐져 있지 않다.
  - 근거 부족 계열 문구가 기계적 거절처럼 보이지 않는다.
  - 채널 대화와 AI가 우측 패널 안에서 자연스럽게 전환된다.
  - 문서 우선 shell에서 PDF가 항상 주인공으로 남는다.

### 4.5 student 문제 풀이 / 결과 modal-first
- URL: `/student/question-sets/:distributionCode/workspace`
- 사전 조건:
  - 학생 계정 로그인 완료
  - 제출 가능한 문제 세트 존재
- 절차:
  1. 모든 문항 답 선택
  2. `제출하기` 클릭
  3. 제출 중 상태 문구 노출 확인
  4. 결과 modal이 즉시 열리는지 확인
  5. modal에서 loading / error / empty / success 중 하나가 명시적으로 표시되는지 확인
  6. modal 닫기 후 결과 재확인 경로 확인
  7. 직접 `/student/submissions/:submissionId` 경로로 진입해 fallback 결과 페이지 확인
  8. 결과 page/modal이 단일 페이지 네비게이션 범위를 넘는 PDF affordance를 암시하지 않는지 확인
- 기대 결과:
  - 제출 직후 blank modal/blank page가 발생하지 않는다.
  - 결과 modal이 먼저 열리고, fallback 페이지도 정상 동작한다.
  - 정답 문항은 compact, 오답 문항은 후속 학습 액션이 보인다.
  - 결과 화면의 PDF affordance는 단일 페이지 네비게이션 범위 안에서만 설명된다.

### 4.6 student 오답 AI 후속 학습
- 사전 조건:
  - 오답이 포함된 제출 결과 존재
- 절차:
  1. 결과 modal 또는 결과 페이지에서 오답 문항 확인
  2. `오답 AI 해설 요청` 클릭
  3. student QA 화면 또는 student workspace로 이동/연결 확인
  4. 질문 입력창에 오답 문맥이 미리 준비되는지 확인
- 기대 결과:
  - 오답 문항별로 AI 해설 재질문 진입이 가능하다.
  - 선택 답 / 관련 개념 / 기존 해설 문맥이 follow-up callout에 보인다.
  - 현재 shipped UX 기준으로는 student QA 화면 또는 question workspace 문맥 안에서 AI 학습으로 이어진다.

## 5. 최소 배포 차단 시나리오
- 로그인/라우팅 실패
- 역할별 홈/워크스페이스 진입 실패
- 제출/결과/QA 화면 핵심 렌더 실패
- 비인가 접근 차단 실패
- 운영자 가입 승인/반려 흐름 실패

## 6. 실제 QA 입력
- frontend URL:
- backend URL:
- teacher 계정:
- student 계정:
- operator 계정:
- 테스트 브라우저:
- 수행자:

### 6.1 기록 규칙
- 로컬 localhost 검증과 배포환경 검증은 같은 실행표에 섞지 않는다.
- 로컬 evidence는 `.sisyphus/evidence/local/<task-name>/...` 아래에, 배포 evidence는 `.sisyphus/evidence/deploy/<task-name>/...` 아래에 저장한다.
- 예시:
  - `.sisyphus/evidence/local/task-12-viewer-last-page-disable.png`
  - `.sisyphus/evidence/local/task-12-dual-toggle-fallback.png`
  - `.sisyphus/evidence/deploy/task-12-teacher-dashboard-flow.png`
- 로컬 기록에는 `SPRING_PROFILES_ACTIVE=local`, FE `vite`(5173), mock teacher 계정을 적는다.
- 배포 기록에는 실제 배포 URL과 배포용 백엔드 URL만 적고, localhost 값은 적지 않는다.

## 7. 이번 변경 전용 실행 체크리스트

### PASS 조건
- [ ] teacher workspace가 PDF-first shell로 보인다.
- [ ] 좌측 nav가 고정 사이드바가 아니라 overlay drawer로 동작한다.
- [ ] 우측 패널이 기본 닫힘 상태다.
- [ ] 좌우 패널이 화면 가장자리 중간 핸들로 열리고 닫힌다.
- [ ] tablet/mobile에서 좌측 nav와 우측 패널이 PDF를 가리지 않는다.
- [ ] PDF viewer가 단일 페이지 네비게이션만 노출한다.
- [ ] `다음` 버튼이 마지막 페이지에서 disabled 된다.
- [ ] `두쪽보기`/`한쪽보기` 토글이 노출되지 않는다.
- [ ] workspace/모달 주요 버튼 라벨이 잘리지 않는다.
- [ ] teacher 홈의 미리보기/상세/워크스페이스 CTA가 역할별로 분리되어 보인다.
- [ ] student 제출 직후 결과 modal이 열린다.
- [ ] 결과 modal/page에 blank 상태가 없다.
- [ ] 오답마다 `오답 AI 해설 요청`이 있다.
- [ ] student AI 응답이 `핵심 답변` 우선 구조다.
- [ ] 근거/evidence가 기본 collapse 상태다.
- [ ] PDF viewer가 true dual-page control을 보장한다고 쓰지 않는다.

### FAIL로 기록해야 하는 예시
- [ ] teacher 채널 관리와 탐색 영역이 다시 겹쳐 보임
- [ ] PDF가 사이드 패널보다 덜 눈에 띔
- [ ] 제출 후 흰 화면 또는 빈 modal 발생
- [ ] 오답 AI 요청이 홈으로 튀거나 문맥 없이 열림
- [ ] AI 응답에서 근거 박스가 기본 펼침으로 노출됨

## 8. 실행 보고서 템플릿

### 8.1 실행 메타
- 테스트 일시:
- 수행자:
- frontend URL:
- backend URL:
- 브라우저 / 버전:
- teacher 계정:
- student 계정:
- 비고:

### 8.2 teacher 채널 워크스페이스 보고서
- 시나리오명: teacher 채널 워크스페이스 구조 검증
- 역할: teacher
- URL: `/teacher/channels/:channelId/workspace`
- 사전 조건 확인:
  - [ ] 교사 로그인 완료
  - [ ] 채널 존재
  - [ ] PDF 연결 완료
- 실행 절차 결과:
  1. 진입 결과:
  2. 좌측 채널 목록 노출 결과:
  3. 중앙 PDF 우선순위 결과:
  4. 우측 패널 분리 결과:
  5. tablet/mobile overlay 결과:
  6. two-page / one-page fallback 결과:
  7. 버튼 라벨 잘림 확인 결과:
- 판정: PASS / FAIL / BLOCKED
- 증거:
  - 스크린샷:
  - 로그/메모:
- 발견 이슈:

### 8.3 student AI/채팅 보고서
- 시나리오명: student 채널 워크스페이스 AI/채팅 검증
- 역할: student
- URL: `/student/channels/:channelId/workspace`
- 사전 조건 확인:
  - [ ] 학생 로그인 완료
  - [ ] PDF 연결 완료
  - [ ] QA 가능 상태
- 실행 절차 결과:
  1. AI 탭 진입 결과:
  2. 질문 전송 결과:
  3. `핵심 답변` 우선 노출 결과:
  4. `전체 답변 보기` 기본 접힘 결과:
  5. `근거 보기` 기본 접힘 결과:
  6. 채널 대화 탭 전환/송수신 결과:
  7. tablet/mobile overlay 패널 결과:
  8. two-page / one-page fallback 결과:
- 판정: PASS / FAIL / BLOCKED
- 증거:
  - 스크린샷:
  - 로그/메모:
- 발견 이슈:

### 8.4 student 제출/결과 modal-first 보고서
- 시나리오명: student 제출 후 결과 modal-first 검증
- 역할: student
- URL: `/student/question-sets/:distributionCode/workspace`
- 사전 조건 확인:
  - [ ] 제출 가능한 문제 세트 존재
- 실행 절차 결과:
  1. 모든 문항 응답 완료 결과:
  2. 제출 버튼 상태 문구 결과:
  3. 결과 modal 즉시 오픈 결과:
  4. loading/error/empty/success 상태 확인 결과:
  5. blank modal/page 부재 확인 결과:
  6. fallback 결과 페이지(`/student/submissions/:submissionId`) 확인 결과:
- 판정: PASS / FAIL / BLOCKED
- 증거:
  - 스크린샷:
  - 로그/메모:
- 발견 이슈:

### 8.5 student 오답 AI 후속 학습 보고서
- 시나리오명: student 오답 AI 후속 학습 연결 검증
- 역할: student
- 사전 조건 확인:
  - [ ] 오답 포함 결과 확보
- 실행 절차 결과:
  1. 오답 문항 확인 결과:
  2. `오답 AI 해설 요청` 클릭 결과:
  3. 채널 워크스페이스 AI 탭 연결 결과:
  4. follow-up callout 문맥 표시 결과:
  5. 질문 입력창 프리필 결과:
- 판정: PASS / FAIL / BLOCKED
- 증거:
  - 스크린샷:
  - 로그/메모:
- 발견 이슈:

## 9. 종합 판정
- 전체 판정: PASS / FAIL / BLOCKED
- 배포 차단 여부: Y / N
- 차단 사유:
- 후속 작업:
