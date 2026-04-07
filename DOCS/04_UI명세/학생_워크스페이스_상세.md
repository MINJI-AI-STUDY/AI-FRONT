# Student Workspace 상세 화면 명세

## 화면 경로
- `/student/question-sets/:distributionCode/workspace`

## 목적
- 학생이 같은 PDF를 보면서 문제를 풀고, 같은 자료 기준으로 채팅형 QA를 수행한다.

## 주요 영역
| 영역 | 설명 |
| --- | --- |
| 상단 header | 자료 제목, 역할 메타, 학생 홈 복귀 |
| 중앙 문서 canvas | PDF inline viewer |
| 우측 quiz 패널 | 빠른 문제 풀이 |
| 우측 chat 패널 | 채팅형 질문/답변/근거 snippet |
| 모달 | 집중 문제 풀이 모달 |

## 상태
| 상태 | 설명 |
| --- | --- |
| loading | 문제 세트 로딩 |
| error | 문제 세트 또는 QA 요청 실패 |
| answering | QA 요청 중 |
| submitting | 제출 중 |
| responded | QA 응답 표시 |

## UX 원칙
- 문서 맥락을 끊지 않는다.
- 문제풀이와 QA는 같은 자료 컨텍스트를 공유한다.
