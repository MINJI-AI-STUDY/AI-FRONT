#VV|# FRONT_MANUAL_QA
#KM|
#YY|## 1. 목적
이 문서는 AI-FRONT의 핵심 UI와 역할 기반 접근 흐름을 수동 검증하기 위한 기준을 정의한다.
#BT|
#VH|## 관련 문서
#TP|- 공통 수동 QA: `../../../DOCS/10_운영/MANUAL_QA_MATRIX.md`
#JR|- 프론트 게이트: `FRONT_RELEASE_GATE.md`
#RT|- 증거 템플릿: `../../../DOCS/10_운영/EVIDENCE_TEMPLATE.md`
#QW|- env 단일 원천: `../../../DOCS/07_정책/ENV_SOURCE_OF_TRUTH.md`
#TJ|
#HB|## 2. 우선 시나리오
#RJ|- teacher 로그인 후 자료/문제 흐름 진입
#HZ|- student 로그인 후 풀이/결과/QA 흐름 진입
#PY|- operator 로그인 후 가입 승인/반려와 허용 범위만 조회
#QP|- 보호 라우트 직접 접근 차단
#MQ|- API 실패 시 에러/빈 상태 UX 확인
#NP|- tablet/mobile에서 문서 우선 shell과 overlay nav 동작 확인
#KS|
#TQ|## 2.1 이번 변경 기준 필수 시나리오
#YQ|
#MX|### teacher 채널 워크스페이스
#NN|- URL: `/teacher/channels/:channelId/workspace`
#BP|- 사전 조건:
#WR|  - 교사 계정 로그인 완료
#JP|  - 채널 1개 이상 존재
#MT|  - 채널에 PDF 1개 이상 연결
#VY|  - 최근 메시지 1개 이상 또는 빈 상태 확인 가능
#MX|- 절차:
#ZY|  1. teacher 채널 워크스페이스 진입
#NJ|  2. 좌측 채널 목록이 기본 고정이 아니라 overlay로 열리는지 확인
#QZ|  3. 중앙 PDF가 가장 큰 시각 요소인지 확인
#SS|  4. 우측 패널이 기본 닫힘 상태에서 필요 시 열리고, `채널 관리 / 현재 PDF / 채널 최근 메시지 / 문제 흐름`이 분리 노출되는지 확인
#ZB|  5. tablet/mobile에서 좌측 nav와 우측 패널이 PDF를 가리지 않게 동작하는지 확인
#XB|  6. `PDF 업로드`, `새 채널 생성`, `문제 생성`, `최근 검토 열기` 버튼 라벨이 잘리지 않는지 확인
#VX|  7. PDF viewer가 page mode/단일 페이지 중심 affordance만 제공하고, true dual-page control을 약속하지 않는지 확인
#BK|- 기대 결과:
#PT|  - 좌측은 탐색, 우측은 운영/보조작업 역할이 명확하다.
#QM|  - teacher workspace는 persistent side-column layout이 아니다.
#TZ|  - PDF viewer helper/chrome이 과도하게 보이지 않는다.
#ZP|  - 우측 최근 메시지가 channel-wide 흐름만 보여준다.
#XR|  - PDF page mode 표현은 구현 가능한 범위만 설명한다.
#ZK|
#RX|### student 채널 워크스페이스 AI/채팅
#TH|- URL: `/student/channels/:channelId/workspace`
#BP|- 사전 조건:
#JH|  - 학생 계정 로그인 완료
#MT|  - 채널에 PDF 1개 이상 연결
#XX|  - AI 질의응답 가능 상태
#MX|- 절차:
#WJ|  1. student 채널 워크스페이스 진입
#VR|  2. 우측 패널에서 `AI 도우미` 탭 선택
#RH|  3. 질문 1건 전송
#QX|  4. 답변에서 `핵심 답변`이 먼저 보이는지 확인
#NQ|  5. `전체 답변 보기`와 `근거 보기`가 기본 접힘 상태인지 확인
#TJ|  6. `채널 대화` 탭으로 전환 후 메시지 송수신 확인
#ZX|  7. tablet/mobile에서 우측 패널이 기본 닫힘/오버레이로 동작하는지 확인
#BK|- 기대 결과:
#RZ|  - AI 답변은 짧은 핵심 요약 우선 구조다.
#WX|  - 근거/evidence는 기본적으로 펼쳐져 있지 않다.
#YQ|  - 근거 부족 계열 문구가 기계적 거절처럼 보이지 않는다.
#KS|  - 채널 대화와 AI가 우측 패널 안에서 자연스럽게 전환된다.
#HL|  - 문서 우선 shell에서 PDF가 항상 주인공으로 남는다.
#QH|
#WZ|### student 문제 풀이 / 결과 modal-first
#KP|- URL: `/student/question-sets/:distributionCode/workspace`
#BP|- 사전 조건:
#JH|  - 학생 계정 로그인 완료
#VV|  - 제출 가능한 문제 세트 존재
#MX|- 절차:
#HN|  1. 모든 문항 답 선택
#VX|  2. `제출하기` 클릭
#VJ|  3. 제출 중 상태 문구 노출 확인
#SV|  4. 결과 modal이 즉시 열리는지 확인
#KW|  5. modal에서 loading / error / empty / success 중 하나가 명시적으로 표시되는지 확인
#YK|  6. modal 닫기 후 결과 재확인 경로 확인
#TJ|  7. 직접 `/student/submissions/:submissionId` 경로로 진입해 fallback 결과 페이지 확인
#QW|  8. 결과 page/modal이 true dual-page PDF control을 암시하지 않는지 확인
#BK|- 기대 결과:
#JW|  - 제출 직후 blank modal/blank page가 발생하지 않는다.
#MN|  - 결과 modal이 먼저 열리고, fallback 페이지도 정상 동작한다.
#YV|  - 정답 문항은 compact, 오답 문항은 후속 학습 액션이 보인다.
#DW|  - 결과 화면의 PDF affordance는 구현 범위 안에서만 설명된다.
#VB|
#PN|### student 오답 AI 후속 학습
#BP|- 사전 조건:
#HT|  - 오답이 포함된 제출 결과 존재
#MX|- 절차:
#XK|  1. 결과 modal 또는 결과 페이지에서 오답 문항 확인
#WP|  2. `오답 AI 해설 요청` 클릭
#MY|  3. student 채널 워크스페이스 AI 탭으로 이동/연결 확인
#JP|  4. 질문 입력창에 오답 문맥이 미리 준비되는지 확인
#BK|- 기대 결과:
#VY|  - 오답 문항별로 AI 해설 재질문 진입이 가능하다.
#XY|  - 선택 답 / 관련 개념 / 기존 해설 문맥이 follow-up callout에 보인다.
#XS|  - 채널 문맥이 유지된 채 AI 학습으로 이어진다.
#QT|
#JH|## 3. 시나리오 템플릿
#NZ|- 시나리오명:
#TX|- 역할:
#RM|- URL:
#BP|- 사전 조건:
#BK|- 기대 결과:
#VH|- 실제 결과:
#NN|- 판정:
#BX|- 증거:
#SR|
#BZ|## 4. 최소 배포 차단 시나리오
#QV|- 로그인/라우팅 실패
#MB|- 역할별 홈/워크스페이스 진입 실패
#ZV|- 제출/결과/QA 화면 핵심 렌더 실패
#BW|- 비인가 접근 차단 실패
#WW|- 운영자 가입 승인/반려 흐름 실패
#TS|
#YN|## 5. 실제 QA 입력
#XX|- frontend URL:
#YV|- backend URL:
#JV|- teacher 계정:
#RJ|- student 계정:
#XX|- operator 계정:
#ZR|- 테스트 브라우저:
#WW|- 수행자:
#BK|
#RM|## 6. 이번 변경 전용 실행 체크리스트
#RM|
#XP|### PASS 조건
#YS|- [ ] teacher workspace가 문서 우선 shell로 보인다.
#MP|- [ ] 좌측 nav가 고정 사이드바가 아니라 overlay로 동작한다.
#TG|- [ ] 우측 패널이 기본 닫힘 상태다.
#QM|- [ ] PDF viewer가 과한 helper/chrome 없이 중앙 주작업면처럼 보인다.
#WK|- [ ] workspace/모달 주요 버튼 라벨이 잘리지 않는다.
#QZ|- [ ] student 제출 직후 결과 modal이 열린다.
#PB|- [ ] 결과 modal/page에 blank 상태가 없다.
#VH|- [ ] 오답마다 `오답 AI 해설 요청`이 있다.
#YS|- [ ] student AI 응답이 `핵심 답변` 우선 구조다.
#HX|- [ ] 근거/evidence가 기본 collapse 상태다.
#LD|- [ ] PDF viewer가 true dual-page control을 보장한다고 쓰지 않는다.
#HP|
#KH|### FAIL로 기록해야 하는 예시
#YS|- [ ] teacher 채널 관리와 탐색 영역이 다시 겹쳐 보임
#QZ|- [ ] PDF가 사이드 패널보다 덜 눈에 띔
#YX|- [ ] 제출 후 흰 화면 또는 빈 modal 발생
#MX|- [ ] 오답 AI 요청이 홈으로 튀거나 문맥 없이 열림
#XJ|- [ ] AI 응답에서 근거 박스가 기본 펼침으로 노출됨
#NQ|
#NB|## 7. 이번 변경 전용 실행 보고서 템플릿
#KK|
#TZ|아래 블록을 그대로 복사해서 실행 결과를 채운다.
#XS|
#SQ|### 7.1 실행 메타
#SB|- 테스트 일시:
#WW|- 수행자:
#XX|- frontend URL:
#YV|- backend URL:
#YP|- 브라우저 / 버전:
#JV|- teacher 계정:
#RJ|- student 계정:
#JY|- 비고:
#PY|
#YX|### 7.2 teacher 채널 워크스페이스 보고서
#QH|- 시나리오명: teacher 채널 워크스페이스 구조 검증
#RX|- 역할: teacher
#NN|- URL: `/teacher/channels/:channelId/workspace`
#RT|- 사전 조건 확인:
#MQ|  - [ ] 교사 로그인 완료
#TZ|  - [ ] 채널 존재
#VB|  - [ ] PDF 연결 완료
#MT|- 실행 절차 결과:
#NZ|  1. 진입 결과:
#MJ|  2. 좌측 채널 목록 노출 결과:
#BS|  3. 중앙 PDF 우선순위 결과:
#NV|  4. 우측 패널 분리 결과:
#VP|  5. 전체 collapse 버튼 부재 확인 결과:
#PZ|  6. 버튼 라벨 잘림 확인 결과:
#MH|- 판정: PASS / FAIL / BLOCKED
#BX|- 증거:
#JM|  - 스크린샷:
#NJ|  - 로그/메모:
#YW|- 발견 이슈:
#NV|
#BX|### 7.3 student AI/채팅 보고서
#SX|- 시나리오명: student 채널 워크스페이스 AI/채팅 검증
#RT|- 역할: student
#TH|- URL: `/student/channels/:channelId/workspace`
#RT|- 사전 조건 확인:
#BZ|  - [ ] 학생 로그인 완료
#VB|  - [ ] PDF 연결 완료
#RM|  - [ ] QA 가능 상태
#MT|- 실행 절차 결과:
#WS|  1. AI 탭 진입 결과:
#WB|  2. 질문 전송 결과:
#TQ|  3. `핵심 답변` 우선 노출 결과:
#PR|  4. `전체 답변 보기` 기본 접힘 결과:
#YZ|  5. `근거 보기` 기본 접힘 결과:
#RT|  6. 채널 대화 탭 전환/송수신 결과:
#LH|  7. tablet/mobile overlay 패널 확인 결과:
#MH|- 판정: PASS / FAIL / BLOCKED
#BX|- 증거:
#JM|  - 스크린샷:
#NJ|  - 로그/메모:
#YW|- 발견 이슈:
#KM|
#SH|### 7.4 student 제출/결과 modal-first 보고서
#WW|- 시나리오명: student 제출 후 결과 modal-first 검증
#RT|- 역할: student
#KP|- URL: `/student/question-sets/:distributionCode/workspace`
#RT|- 사전 조건 확인:
#HV|  - [ ] 제출 가능한 문제 세트 존재
#MT|- 실행 절차 결과:
#MZ|  1. 모든 문항 응답 완료 결과:
#ZT|  2. 제출 버튼 상태 문구 결과:
#VP|  3. 결과 modal 즉시 오픈 결과:
#WT|  4. loading/error/empty/success 상태 확인 결과:
#ZH|  5. blank modal/page 부재 확인 결과:
#XM|  6. fallback 결과 페이지(`/student/submissions/:submissionId`) 확인 결과:
#MH|- 판정: PASS / FAIL / BLOCKED
#BX|- 증거:
#JM|  - 스크린샷:
#NJ|  - 로그/메모:
#YW|- 발견 이슈:
#YZ|
#RB|### 7.5 student 오답 AI 후속 학습 보고서
#WJ|- 시나리오명: student 오답 AI 후속 학습 연결 검증
#RT|- 역할: student
#RT|- 사전 조건 확인:
#PX|  - [ ] 오답 포함 결과 확보
#MT|- 실행 절차 결과:
#XV|  1. 오답 문항 확인 결과:
#WX|  2. `오답 AI 해설 요청` 클릭 결과:
#YW|  3. 채널 워크스페이스 AI 탭 연결 결과:
#MS|  4. follow-up callout 문맥 표시 결과:
#WQ|  5. 질문 입력창 프리필 결과:
#MH|- 판정: PASS / FAIL / BLOCKED
#BX|- 증거:
#JM|  - 스크린샷:
#NJ|  - 로그/메모:
#YW|- 발견 이슈:
#PR|
#TB|### 7.6 종합 판정
#NS|- 전체 판정: PASS / FAIL / BLOCKED
#QZ|- 배포 차단 여부: Y / N
#NZ|- 차단 사유:
#YH|- 후속 작업:
