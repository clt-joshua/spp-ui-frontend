# 문서 카탈로그

이 폴더는 프로젝트 문서를 역할별로 보관한다. 파일명의 기존 번호는 원래 읽기 순서와 추적성을 보존하며, 폴더는 문서의 책임을 나타낸다.

## 분류

| 분류 | 책임 | 문서 |
|---|---|---|
| `00-governance` | 권위, 충돌 처리, 준수·병합 게이트 | [M3 Web 준수 정책](00-governance/00-M3-WEB-COMPLIANCE.md) |
| `01-product` | 제품 목표, 범위, ADR, 위험 | [목표와 아키텍처 결정](01-product/02-GOALS-AND-DECISIONS.md) |
| `02-architecture` | 시스템 경계, Theme/token, 컴포넌트 계약 | [프로젝트 설정](02-architecture/03-ARCHITECTURE-AND-SETUP.md), [Theme](02-architecture/04-TOKENS-AND-DYNAMIC-THEME.md), [컴포넌트](02-architecture/05-COMPONENTS-AND-INTERACTIONS.md) |
| `03-delivery` | 구현 순서, 검증, AI 작업 방식 | [구현·검증](03-delivery/06-IMPLEMENTATION-AND-VALIDATION.md), [플레이북](03-delivery/07-VIBE-CODING-PLAYBOOK.md), [CI/시각 검토 운영 기준](03-delivery/08-CI-AND-VISUAL-BASELINE-PROPOSAL.md), [UI 구현 상태](03-delivery/09-UI-IMPLEMENTATION-STATUS.md) |
| `04-reference` | 공식 문서 매핑, 버전·라이선스 기준선 | [문서 적용 지도](04-reference/01-MATERIAL-WEB-DOC-MAP.md), [공식 출처](04-reference/SOURCES.md) |
| `project-memory` | 현재 상태, 결정 탐색, 미결 게이트 | [메모리 안내](project-memory/README.md) |

## 권장 읽기 순서

1. 루트 [PROJECT_MEMORY.md](../PROJECT_MEMORY.md)에서 현재 phase와 다음 행동을 확인한다.
2. governance에서 권위와 실패 조건을 확인한다.
3. reference의 문서 적용 지도로 공식 근거를 연결한다.
4. product에서 범위와 ADR을 확인한다.
5. architecture의 설정 → Theme → 컴포넌트 계약을 읽는다.
6. delivery의 단계별 게이트와 검증 절차를 따른다.

## 문서 상태 규칙

- 원본 설계 문서는 승인된 계약이며, 구조 이동 외에는 의미를 조용히 바꾸지 않는다.
- 라이브 문서와 고정 snapshot의 차이는 영향 분석 후 같은 변경에서 기준선·준수 기록·테스트를 갱신한다.
- 현재 구현 상태나 일시적 관찰은 설계 문서가 아니라 `project-memory`에 기록한다.
- 미확정 정책은 `OPEN-QUESTIONS.md`에 두고 확정된 뒤 ADR 또는 해당 계약 문서로 승격한다.
- 링크와 필수 구조는 `pnpm validate:structure`로 검사한다. Windows에서는 `scripts/validate-project-structure.ps1` wrapper도 사용할 수 있다.
