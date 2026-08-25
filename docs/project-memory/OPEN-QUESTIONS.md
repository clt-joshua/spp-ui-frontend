# 미결 질문과 구현 게이트

관찰일: 2026-08-25

## 열린 제품·운영 결정

현재 구현을 막는 열린 제품 결정은 없다. 새 범위나 제품 정책은 임의 기본값으로 추가하지 않는다.

## 2026-08-25 확정 결정

| ID | 결정 | 반영 위치 |
|---|---|---|
| Q-001 | Vite 8 + React 19 + TypeScript를 대표 host로 사용하고 `src/ui`는 host-neutral 유지 | ADR-009, `package.json`, `vite.config.ts` |
| Q-002 | Node.js 24.x와 pnpm 10.33.x를 baseline으로 사용 | ADR-010, engine/version files |
| Q-004 | Material Icons Filled와 Roboto Variable을 self-host하고 adapter/token으로 교체 가능하게 구성 | ADR-011, `MaterialIcon`, `reference.css` |
| Q-005 | GitHub Actions + Playwright Git baseline, 25MB 재검토 기준, failure artifact 14일 | ADR-012, `ci.yml`, Playwright config와 6개 baseline |
| Q-003 | Theme 설정과 프로젝트 생성을 결합한 Theme Lab을 대표 제품 화면으로 사용 | ADR-013, `src/App.tsx`, E2E/visual baseline |

## 문서 정합성 검증

| ID | 항목 | 관찰 | 필요한 조치 |
|---|---|---|---|
| V-001 | Select의 M3 직접 근거 | 구현 계획은 모든 MVP에 M3 URL을 요구하지만 문서 지도는 Select에 Material Web 문서만 직접 연결 | 구현 전 공식 M3 foundation/component 근거를 명시하고 manifest 갱신 |
| V-002 | Tooltip Provider | `UIProvider` 예시에 MVP 밖인 `Tooltip.Provider`가 포함됨 | Tooltip을 foundation 의존성으로 승인하거나 예시에서 제거하는 ADR 판단 |
| V-003 | Snackbar 대체 근거 | M3 Snackbar와 Base UI Toast 근거를 고정했고 자동 UI/axe 및 실제 F6 viewport 이동은 PASS | 실제 screen reader announcement를 검증 |
| V-004 | 브라우저·AT 지원표 | Chromium/Firefox/WebKit E2E와 axe critical/serious 0건은 확인했으나 실제 forced-colors/AT 조합은 미확정 | forced-colors/AT 검증 범위와 결과 기록 |

이 목록의 항목을 임의 기본값으로 닫지 않는다. 구현과 독립적인 공식 문서 비교는 계속 진행할 수 있으며, 제품/도구chain 선택이 필요한 항목만 사용자 결정으로 남긴다.
