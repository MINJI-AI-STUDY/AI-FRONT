# 기능 요구사항 명세서

| ID | 업무구분 | 요구사항 명 | 상세 설명 | 우선순위 | 의존성 |
| --- | --- | --- | --- | --- | --- |
| FR-FRONT-001 | 인증 | 로그인/권한 진입 | 역할별 홈으로 진입하고 보호 라우트를 적용한다. | P1 | 없음 |
| FR-FRONT-002 | Workspace | 공통 문서 뷰 | teacher/student가 같은 PDF를 중심으로 본다. | P1 | FR-FRONT-001 |
| FR-FRONT-003 | Teacher | 문제 생성/검토 UI | 교사는 자료 기준 문제 생성과 검토를 할 수 있다. | P1 | FR-FRONT-002 |
| FR-FRONT-004 | Student | 문제 풀이 UI | 학생은 배포 코드로 진입하고 제출/결과를 볼 수 있다. | P1 | FR-FRONT-002 |
| FR-FRONT-005 | QA | 채팅형 질의응답 UI | 학생은 같은 자료 기준 채팅형 QA를 사용할 수 있다. | P1 | FR-FRONT-002 |
