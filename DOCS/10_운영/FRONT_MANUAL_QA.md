#BW|#VV|# FRONT_MANUAL_QA
#NM|#KM|
#PX|#YY|## 1. 목적
#TN|이 문서는 AI-FRONT의 핵심 UI와 역할 기반 접근 흐름을 수동 검증하기 위한 기준을 정의한다.
#BV|#BT|
#XK|#VH|## 관련 문서
#RJ|#TP|- 공통 수동 QA: `../../../DOCS/10_운영/MANUAL_QA_MATRIX.md`
#YZ|#JR|- 프론트 게이트: `FRONT_RELEASE_GATE.md`
#MR|#RT|- 증거 템플릿: `../../../DOCS/10_운영/EVIDENCE_TEMPLATE.md`
#YH|#QW|- env 단일 원천: `../../../DOCS/07_정책/ENV_SOURCE_OF_TRUTH.md`
#BY|#TJ|
#QZ|#HB|## 2. 우선 시나리오
#XY|#RJ|- teacher 로그인 후 자료/문제 흐름 진입
#HT|#HZ|- student 로그인 후 풀이/결과/QA 흐름 진입
#VY|#PY|- operator 로그인 후 가입 승인/반려와 허용 범위만 조회
#WP|#QP|- 보호 라우트 직접 접근 차단
#WK|#MQ|- API 실패 시 에러/빈 상태 UX 확인
#ZR|#NP|- tablet/mobile에서 문서 우선 shell과 drawer nav 동작 확인
#SM|#KS|
#VS|#TQ|## 2.1 이번 변경 기준 필수 시나리오
#WT|#YQ|
#RM|#MX|### teacher 채널 워크스페이스
#MW|#NN|- URL: `/teacher/channels/:channelId/workspace`
#BY|#BP|- 사전 조건:
#MV|#WR|  - 교사 계정 로그인 완료
#WR|#JP|  - 채널 1개 이상 존재
#BV|#MT|  - 채널에 PDF 1개 이상 연결
#QK|#VY|  - 최근 메시지 1개 이상 또는 빈 상태 확인 가능
#SZ|#MX|- 절차:
#XQ|#ZY|  1. teacher 채널 워크스페이스 진입
#KT|#NJ|  2. 좌측 채널 목록이 기본 고정이 아니라 drawer로 열리는지 확인
#KZ|#QZ|  3. 첫 진입에서 중앙 PDF가 가장 큰 시각 요소인지 확인
#JW|#SS|  4. 우측 패널이 기본 닫힘 상태에서 필요 시 열리고, `채널 관리 / 현재 PDF / 채널 최근 메시지 / 문제 흐름`이 contextual sheet/drawer로 분리 노출되는지 확인
#WY|#ZB|  5. tablet/mobile first load에서 좌측 nav와 우측 패널이 PDF를 가리지 않게 동작하는지 확인
#PQ|#XB|  6. `PDF 업로드`, `새 채널 생성`, `문제 생성`, `최근 검토 열기` 버튼 라벨이 잘리지 않고 compact header 안에 과밀하지 않은지 확인
#XK|#VX|  7. PDF viewer가 page mode/단일 페이지 중심 affordance만 제공하고, true dual-page control을 약속하지 않는지 확인
#NQ|#BK|- 기대 결과:
#YH|#PT|  - 좌측은 탐색, 우측은 운영/보조작업 역할이 명확하다.
#MB|#QM|  - teacher workspace는 persistent side-column layout이 아니다.
#NP|#TZ|  - PDF viewer helper/chrome이 과도하게 보이지 않는다.
#KJ|#ZP|  - 우측 최근 메시지가 channel-wide 흐름만 보여준다.
#VH|#XR|  - PDF page mode 표현은 구현 가능한 범위만 설명한다.
#NT|#ZK|
#XJ|#RX|### student 채널 워크스페이스 AI/채팅
#QT|#TH|- URL: `/student/channels/:channelId/workspace`
#BY|#BP|- 사전 조건:
#YW|#JH|  - 학생 계정 로그인 완료
#BV|#MT|  - 채널에 PDF 1개 이상 연결
#XN|#XX|  - AI 질의응답 가능 상태
#SZ|#MX|- 절차:
#JH|#WJ|  1. student 채널 워크스페이스 진입
#NQ|#VR|  2. 우측 패널에서 `AI 도우미` 탭 선택
#VW|#RH|  3. 질문 1건 전송
#VP|#QX|  4. 답변에서 `핵심 답변`이 먼저 보이는지 확인
#RV|#NQ|  5. `전체 답변 보기`와 `근거 보기`가 기본 접힘 상태인지 확인
#RV|#TJ|  6. `채널 대화` 탭으로 전환 후 메시지 송수신 확인
#XJ|#ZX|  7. tablet/mobile에서 우측 패널이 기본 닫힘/drawer로 동작하는지 확인
#NQ|#BK|- 기대 결과:
#WK|#RZ|  - AI 답변은 짧은 핵심 요약 우선 구조다.
#VY|#WX|  - 근거/evidence는 기본적으로 펼쳐져 있지 않다.
#NT|#YQ|  - 근거 부족 계열 문구가 기계적 거절처럼 보이지 않는다.
#PP|#KS|  - 채널 대화와 AI가 우측 패널 안에서 자연스럽게 전환된다.
#RN|#HL|  - 문서 우선 shell에서 PDF가 항상 주인공으로 남는다.
#WJ|#QH|
#XJ|#WZ|### student 문제 풀이 / 결과 modal-first
#MX|#KP|- URL: `/student/question-sets/:distributionCode/workspace`
#BY|#BP|- 사전 조건:
#YW|#JH|  - 학생 계정 로그인 완료
#JV|#VV|  - 제출 가능한 문제 세트 존재
#SZ|#MX|- 절차:
#QT|#HN|  1. 모든 문항 답 선택
#KP|#VX|  2. `제출하기` 클릭
#QB|#VJ|  3. 제출 중 상태 문구 노출 확인
#QJ|#SV|  4. 결과 modal이 즉시 열리는지 확인
#KS|#KW|  5. modal에서 loading / error / empty / success 중 하나가 명시적으로 표시되는지 확인
#SV|#YK|  6. modal 닫기 후 결과 재확인 경로 확인
#BT|#TJ|  7. 직접 `/student/submissions/:submissionId` 경로로 진입해 fallback 결과 페이지 확인
#XY|#QW|  8. 결과 page/modal이 true dual-page PDF control을 암시하지 않는지 확인
#NQ|#BK|- 기대 결과:
#BY|#JW|  - 제출 직후 blank modal/blank page가 발생하지 않는다.
#TV|#MN|  - 결과 modal이 먼저 열리고, fallback 페이지도 정상 동작한다.
#YZ|#YV|  - 정답 문항은 compact, 오답 문항은 후속 학습 액션이 보인다.
#YZ|#DW|  - 결과 화면의 PDF affordance는 구현 범위 안에서만 설명된다.
#KP|#VB|
#BK|#PN|### student 오답 AI 후속 학습
#BY|#BP|- 사전 조건:
#RX|#HT|  - 오답이 포함된 제출 결과 존재
#SZ|#MX|- 절차:
#JS|#XK|  1. 결과 modal 또는 결과 페이지에서 오답 문항 확인
#PX|#WP|  2. `오답 AI 해설 요청` 클릭
#XR|#MY|  3. student 채널 워크스페이스 AI 탭으로 이동/연결 확인
#ZS|#JP|  4. 질문 입력창에 오답 문맥이 미리 준비되는지 확인
#NQ|#BK|- 기대 결과:
#ZW|#VY|  - 오답 문항별로 AI 해설 재질문 진입이 가능하다.
#XM|#XY|  - 선택 답 / 관련 개념 / 기존 해설 문맥이 follow-up callout에 보인다.
#MV|#XS|  - 채널 문맥이 유지된 채 AI 학습으로 이어진다.
#SZ|#QT|
#PW|#JH|## 3. 시나리오 템플릿
#ZH|#NZ|- 시나리오명:
#JT|#TX|- 역할:
#QM|#RM|- URL:
#BY|#BP|- 사전 조건:
#NQ|#BK|- 기대 결과:
#BM|#VH|- 실제 결과:
#WR|#NN|- 판정:
#NM|#BX|- 증거:
#KN|#SR|
#KZ|#BZ|## 4. 최소 배포 차단 시나리오
#ZJ|#QV|- 로그인/라우팅 실패
#TY|#MB|- 역할별 홈/워크스페이스 진입 실패
#BQ|#ZV|- 제출/결과/QA 화면 핵심 렌더 실패
#YM|#BW|- 비인가 접근 차단 실패
#KX|#WW|- 운영자 가입 승인/반려 흐름 실패
#MM|#TS|
#RM|#YN|## 5. 실제 QA 입력
#HK|#XX|- frontend URL:
#XY|#YV|- backend URL:
#KK|#JV|- teacher 계정:
#BT|#RJ|- student 계정:
#SX|#XX|- operator 계정:
#XX|#ZR|- 테스트 브라우저:
#MN|#WW|- 수행자:
#BT|#BK|
#MW|#RM|## 6. 이번 변경 전용 실행 체크리스트
#VQ|#RM|
#WR|#XP|### PASS 조건
#PW|#YS|- [ ] teacher workspace가 document-first shell로 보인다.
#MQ|#MP|- [ ] 좌측 nav가 고정 사이드바가 아니라 drawer로 동작한다.
#QN|#TG|- [ ] 우측 패널이 기본 닫힘 상태다.
#YT|#QM|- [ ] PDF viewer가 과한 helper/chrome 없이 중앙 주작업면처럼 보인다.
#ZX|#WK|- [ ] workspace/모달 주요 버튼 라벨이 잘리지 않는다.
#PW|#QZ|- [ ] student 제출 직후 결과 modal이 열린다.
#ZB|#PB|- [ ] 결과 modal/page에 blank 상태가 없다.
#HK|#VH|- [ ] 오답마다 `오답 AI 해설 요청`이 있다.
#VR|#YS|- [ ] student AI 응답이 `핵심 답변` 우선 구조다.
#TS|#HX|- [ ] 근거/evidence가 기본 collapse 상태다.
#HN|#LD|- [ ] PDF viewer가 true dual-page control을 보장한다고 쓰지 않는다.
#PK|#HP|
#HN|#KH|### FAIL로 기록해야 하는 예시
#ZZ|#YS|- [ ] teacher 채널 관리와 탐색 영역이 다시 겹쳐 보임
#BP|#QZ|- [ ] PDF가 사이드 패널보다 덜 눈에 띔
#KZ|#YX|- [ ] 제출 후 흰 화면 또는 빈 modal 발생
#YM|#MX|- [ ] 오답 AI 요청이 홈으로 튀거나 문맥 없이 열림
#KB|#XJ|- [ ] AI 응답에서 근거 박스가 기본 펼침으로 노출됨
#YK|#NQ|
#YK|#NB|## 7. 이번 변경 전용 실행 보고서 템플릿
#MW|#KK|
#HB|#TZ|아래 블록을 그대로 복사해서 실행 결과를 채운다.
#QY|#XS|
#VK|#SQ|### 7.1 실행 메타
#YX|#SB|- 테스트 일시:
#MN|#WW|- 수행자:
#HK|#XX|- frontend URL:
#XY|#YV|- backend URL:
#TH|#YP|- 브라우저 / 버전:
#KK|#JV|- teacher 계정:
#BT|#RJ|- student 계정:
#KN|#JY|- 비고:
#QH|#PY|
#JW|#YX|### 7.2 teacher 채널 워크스페이스 보고서
#BP|#QH|- 시나리오명: teacher 채널 워크스페이스 구조 검증
#TY|#RX|- 역할: teacher
#MW|#NN|- URL: `/teacher/channels/:channelId/workspace`
#TM|#RT|- 사전 조건 확인:
#BR|#MQ|  - [ ] 교사 로그인 완료
#YN|#TZ|  - [ ] 채널 존재
#TQ|#VB|  - [ ] PDF 연결 완료
#PK|#MT|- 실행 절차 결과:
#NP|#NZ|  1. 진입 결과:
#JP|#MJ|  2. 좌측 채널 목록 노출 결과:
#QM|#BS|  3. 중앙 PDF 우선순위 결과:
#PH|#NV|  4. 우측 패널 분리 결과:
#TV|#VP|  5. 전체 collapse 버튼 부재 확인 결과:
#BK|#PZ|  6. 버튼 라벨 잘림 확인 결과:
#HY|#MH|- 판정: PASS / FAIL / BLOCKED
#NM|#BX|- 증거:
#KS|#JM|  - 스크린샷:
#RQ|#NJ|  - 로그/메모:
#XM|#YW|- 발견 이슈:
#YH|#NV|
#TW|#BX|### 7.3 student AI/채팅 보고서
#HQ|#SX|- 시나리오명: student 채널 워크스페이스 AI/채팅 검증
#YJ|#RT|- 역할: student
#QT|#TH|- URL: `/student/channels/:channelId/workspace`
#TM|#RT|- 사전 조건 확인:
#PK|#BZ|  - [ ] 학생 로그인 완료
#TQ|#VB|  - [ ] PDF 연결 완료
#WH|#RM|  - [ ] QA 가능 상태
#PK|#MT|- 실행 절차 결과:
#NT|#WS|  1. AI 탭 진입 결과:
#MZ|#WB|  2. 질문 전송 결과:
#BT|#TQ|  3. `핵심 답변` 우선 노출 결과:
#MX|#PR|  4. `전체 답변 보기` 기본 접힘 결과:
#NJ|#YZ|  5. `근거 보기` 기본 접힘 결과:
#WP|#RT|  6. 채널 대화 탭 전환/송수신 결과:
#SR|#LH|  7. tablet/mobile overlay 패널 확인 결과:
#HY|#MH|- 판정: PASS / FAIL / BLOCKED
#NM|#BX|- 증거:
#KS|#JM|  - 스크린샷:
#RQ|#NJ|  - 로그/메모:
#XM|#YW|- 발견 이슈:
#NM|#KM|
#YX|#SH|### 7.4 student 제출/결과 modal-first 보고서
#KR|#WW|- 시나리오명: student 제출 후 결과 modal-first 검증
#YJ|#RT|- 역할: student
#MX|#KP|- URL: `/student/question-sets/:distributionCode/workspace`
#TM|#RT|- 사전 조건 확인:
#ZP|#HV|  - [ ] 제출 가능한 문제 세트 존재
#PK|#MT|- 실행 절차 결과:
#TQ|#MZ|  1. 모든 문항 응답 완료 결과:
#BW|#ZT|  2. 제출 버튼 상태 문구 결과:
#BB|#VP|  3. 결과 modal 즉시 오픈 결과:
#JM|#WT|  4. loading/error/empty/success 상태 확인 결과:
#RM|#ZH|  5. blank modal/page 부재 확인 결과:
#RN|#XM|  6. fallback 결과 페이지(`/student/submissions/:submissionId`) 확인 결과:
#HY|#MH|- 판정: PASS / FAIL / BLOCKED
#NM|#BX|- 증거:
#KS|#JM|  - 스크린샷:
#RQ|#NJ|  - 로그/메모:
#XM|#YW|- 발견 이슈:
#RN|#YZ|
#SV|#RB|### 7.5 student 오답 AI 후속 학습 보고서
#HM|#WJ|- 시나리오명: student 오답 AI 후속 학습 연결 검증
#YJ|#RT|- 역할: student
#TM|#RT|- 사전 조건 확인:
#TN|#PX|  - [ ] 오답 포함 결과 확보
#PK|#MT|- 실행 절차 결과:
#VN|#XV|  1. 오답 문항 확인 결과:
#TR|#WX|  2. `오답 AI 해설 요청` 클릭 결과:
#BT|#YW|  3. 채널 워크스페이스 AI 탭 연결 결과:
#YY|#MS|  4. follow-up callout 문맥 표시 결과:
#PY|#WQ|  5. 질문 입력창 프리필 결과:
#HY|#MH|- 판정: PASS / FAIL / BLOCKED
#NM|#BX|- 증거:
#KS|#JM|  - 스크린샷:
#RQ|#NJ|  - 로그/메모:
#XM|#YW|- 발견 이슈:
#PX|#PR|
#XY|#TB|### 7.6 종합 판정
#PP|#NS|- 전체 판정: PASS / FAIL / BLOCKED
#PK|#QZ|- 배포 차단 여부: Y / N
#WS|#NZ|- 차단 사유:
#PS|#YH|- 후속 작업:
