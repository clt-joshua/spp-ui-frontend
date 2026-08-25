# 프로젝트 메모리 운영

이 폴더는 긴 설계 문서를 다시 해석하지 않고도 현재 작업을 안전하게 이어가기 위한 운영 인덱스다. 설계 권위를 대체하지 않으며, 충돌 시 governance와 ADR을 우선한다.

## 파일 역할

- [CURRENT-STATE.md](CURRENT-STATE.md): 현재 phase, 실제 구현 상태, 준비도와 다음 진입점
- [DECISION-INDEX.md](DECISION-INDEX.md): 승인된 ADR과 기술 계약의 빠른 탐색표
- [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md): 구현 전 결정 또는 공식 근거 검증이 필요한 항목

## 갱신 시점

- phase 또는 실제 도달 가능한 사용자 흐름이 바뀔 때
- 의존성·런타임·브라우저 기준선이 확정되거나 변경될 때
- ADR이 추가·대체될 때
- blocker나 `M3_WEB_SPEC_CONFLICT`가 생성·해결될 때
- 대표 앱 흐름의 검증 결과가 달라질 때

기록에는 관찰일과 증거 경로를 포함하고, 테스트 결과를 실제 제품 상태로 확대 해석하지 않는다.
