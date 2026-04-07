# Teacher Workspace 상세 화면 명세

## 화면 경로
- `/teacher/materials/:materialId/workspace`

## 목적
- 교사가 같은 PDF를 보면서 문제 생성, 생성 결과 확인, 검토 화면 진입을 수행한다.

## 주요 영역
| 영역 | 설명 |
| --- | --- |
| 상단 header | 자료 제목, 역할 메타, 교사 홈 복귀 |
| 중앙 문서 canvas | PDF inline viewer |
| 우측 생성 패널 | 문항 수, 난이도, AI 문제 생성 버튼 |
| 우측 JSON 패널 | 문제 생성 결과 JSON preview + 확대 모달 |

## 상태
| 상태 | 설명 |
| --- | --- |
| loading | 자료 로딩 중 |
| error | 자료 조회 실패 |
| idle | 생성 전 |
| generating | 생성 요청 중 |
| generated | JSON 결과 표시 |

## 액션
- 문제 생성
- 검토 화면 열기
- JSON 크게 보기
