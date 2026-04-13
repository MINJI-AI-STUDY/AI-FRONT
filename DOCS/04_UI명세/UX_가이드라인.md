# UX 가이드라인

## 핵심 원칙
- 문서 맥락을 끊지 않는다.
- 모달은 보조 행동에만 사용한다.
- teacher/student는 같은 자료를 중심으로 보는 shared shell이며, first paint는 PDF-first로 시작한다.
- 좌측 내비게이션은 항상 열린 고정 사이드바가 아니라 필요할 때 여는 overlay drawer로 설계한다.
- 우측 기능 패널은 detached resident sidebar가 아니라 기본 닫힌 contextual sheet/drawer로, 필요한 순간만 소환한다.
- compact header 1개만 유지하고, 역할 메타/복귀 CTA는 문서 흐름을 방해하지 않게 배치한다.
- PDF viewer는 현재 구현의 한계에 맞게 readable viewport에서는 two-page spread, 좁은 화면에서는 one-page fallback을 제공한다.
- 실제 양면 동시 제어를 약속하지 말고, page/spread 중심의 honest affordance만 제시한다.
- 학생 channel CTA와 student question workspace의 solve/submit primary actions는 tablet/mobile에서도 main flow 안에 노출한다.
- tablet/mobile first load에서는 PDF와 현재 과제의 핵심 정보가 먼저 보여야 하며, side surface는 나중에 여는 것이 기본이다.
- 오류/빈상태는 행동 유도를 포함한다.
