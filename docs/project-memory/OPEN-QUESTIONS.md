# 미결 질문과 구현 게이트

관찰일: 2026-08-25

## 열린 제품·운영 결정

| ID | 항목 | 현재 상태 | 영향 | 종료 조건 |
|---|---|---|---|---|
| Q-003 | 대표 제품 화면 | UI system 외 앱 요구가 없음 | 실제 E2E 완료 증거를 만들 수 없음 | 8개 컴포넌트를 자연스럽게 쓰는 대표 흐름 확정 |

## 2026-08-25 확정 결정

| ID | 결정 | 반영 위치 |
|---|---|---|
| Q-001 | Vite 8 + React 19 + TypeScript를 대표 host로 사용하고 `src/ui`는 host-neutral 유지 | ADR-009, `package.json`, `vite.config.ts` |
| Q-002 | Node.js 24.x와 pnpm 10.33.x를 baseline으로 사용 | ADR-010, engine/version files |
| Q-004 | Material Icons Filled와 Roboto Variable을 self-host하고 adapter/token으로 교체 가능하게 구성 | ADR-011, `MaterialIcon`, `reference.css` |
| Q-005 | GitHub Actions + Playwright Git baseline, 25MB 재검토 기준, failure artifact 14일 | ADR-012, `ci.yml`, Playwright config와 6개 baseline |

## 문서 정합성 검증

| ID | 항목 | 관찰 | 필요한 조치 |
|---|---|---|---|
| V-001 | Select의 M3 직접 근거 | 구현 계획은 모든 MVP에 M3 URL을 요구하지만 문서 지도는 Select에 Material Web 문서만 직접 연결 | 구현 전 공식 M3 foundation/component 근거를 명시하고 manifest 갱신 |
| V-002 | Tooltip Provider | `UIProvider` 예시에 MVP 밖인 `Tooltip.Provider`가 포함됨 | Tooltip을 foundation 의존성으로 승인하거나 예시에서 제거하는 ADR 판단 |
| V-003 | Snackbar 대체 근거 | Material Web 대응 문서가 `unavailable` | M3 Snackbar + Base UI Toast + APG/WCAG 증거 범위를 compliance record에 고정 |
| V-004 | 브라우저·AT 지원표 | Chromium/Firefox/WebKit behavior matrix는 확정됐으나 forced-colors와 assistive technology 범위가 없음 | forced-colors/AT 검증 범위 기록 |

이 목록의 항목을 임의 기본값으로 닫지 않는다. 구현과 독립적인 공식 문서 비교는 계속 진행할 수 있으며, 제품/도구chain 선택이 필요한 항목만 사용자 결정으로 남긴다.
