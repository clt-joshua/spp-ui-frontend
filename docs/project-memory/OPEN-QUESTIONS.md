# 미결 질문과 구현 게이트

관찰일: 2026-09-03

## 열린 제품·운영 결정

현재 구현을 막는 열린 제품 결정은 없다. Switch는 small 단일 규격으로 확정되어 large/medium과 해당 opacity 충돌을 제품 범위에서 제거했다. 새 범위나 제품 정책은 임의 기본값으로 추가하지 않는다.

## 2026-08-25 확정 결정

| ID | 결정 | 반영 위치 |
|---|---|---|
| Q-001 | Vite 8 + React 19 + TypeScript를 대표 host로 사용하고 `src/ui`는 host-neutral 유지 | ADR-009, `package.json`, `vite.config.ts` |
| Q-002 | Node.js 24.x와 pnpm 10.33.x를 baseline으로 사용 | ADR-010, engine/version files |
| Q-004 | Material Icons Filled와 Noto Sans Variable을 self-host하고 adapter/token으로 교체 가능하게 구성. 2026-09-02 Figma Text Style authority에 따라 기존 Roboto 기본값 교체 | ADR-011, `MaterialIcon`, `reference.css`, `system.css` |
| Q-005 | GitHub Actions quality + 3-browser E2E, failure artifact 14일. Linux visual gate는 2026-09-02 폐기 | ADR-012, `ci.yml`, Playwright config |
| Q-003 | `/` Theme Lab을 대표 제품 흐름으로, `/components`를 공개 컴포넌트 검증 workspace로 사용 | ADR-013, `src/App.tsx`, `src/pages/ComponentGalleryPage.tsx`, E2E |

## 문서 정합성 검증

| ID | 항목 | 관찰 | 필요한 조치 |
|---|---|---|---|
| V-001 | Select의 M3 직접 근거 | 해결: M3에 Select 단독 문서가 없어 M3 Text fields + Menus를 composite component 근거로, Material Web Select main/snapshot을 Web 구현 근거로 manifest에 고정 | 없음. 공식 Select 단독 문서가 생기면 freshness 검토 |
| V-002 | Tooltip Provider | `UIProvider` 예시에 MVP 밖인 `Tooltip.Provider`가 포함됨 | Tooltip을 foundation 의존성으로 승인하거나 예시에서 제거하는 ADR 판단 |
| V-003 | Snackbar 대체 근거 | M3 Snackbar와 Base UI Toast 근거를 고정했고 자동 UI/axe 및 실제 F6 viewport 이동은 PASS | 실제 screen reader announcement를 검증 |
| V-004 | 브라우저·AT 지원표 | Chromium/Firefox/WebKit E2E와 axe critical/serious 0건은 확인했다. 실제 검증은 동적 announcement·복합 focus의 대표 screen reader 조합과 Windows Contrast Themes로 한정한다. | 대표 조합과 결과 기록 |
| V-005 | Segmented Button Stable Web 문서 | M3 component 문서는 있지만 Stable Material Web 공개 문서는 없고 공식 구현은 Labs에 있다. runtime 의존 없이 source behavior만 교차 검증하고 manifest에 `unavailable`로 기록했다. | Stable 문서/구현이 공개되면 freshness 및 API 차이 재검토 |

## 접근성 실환경 검증 필요성 판정

| 항목 | 판정 | 필요한 이유와 범위 |
|---|---|---|
| 실제 screen reader | 적용 대상에 필요 | 모든 native control의 일괄 수동 검사는 요구하지 않는다. Snackbar live-region, TextField 오류·설명, Checkbox mixed state, Radio group 위치·선택 변경, Tabs 위치·선택·panel 문맥, Segmented Button group/pressed 상태, Select/Menu/Dialog/ChipSet의 이름·상태·포커스 문맥처럼 DOM/axe만으로 실제 announcement를 확인할 수 없는 흐름을 대표 AT 조합에서 검증한다. |
| Windows forced-colors | 지원 범위 유지 시 필요 | 브라우저가 author color뿐 아니라 box-shadow와 일부 background를 강제로 제거하므로 경계·focus·selected·disabled·error 상태가 사라질 수 있다. 현재 CSS가 Windows Contrast Themes 지원을 명시하므로 실제 렌더를 확인한다. 지원 대상에서 제외하려면 별도 제품 결정으로 CSS와 manifest blocker를 함께 제거한다. |

실제 screen reader 사용 자체가 WCAG의 독립 성공 기준은 아니다. 검증 대상은 WCAG 4.1.3 상태 메시지와 각 컴포넌트의 programmatic name/role/state/focus 결과다. forced-colors도 모든 Web 제품의 독립 의무가 아니라, 이 프로젝트가 Windows Contrast Themes를 지원한다고 선언한 동안의 호환성 증거다.

이 목록의 항목을 임의 기본값으로 닫지 않는다. 구현과 독립적인 공식 문서 비교는 계속 진행할 수 있으며, 제품/도구chain 선택이 필요한 항목만 사용자 결정으로 남긴다.
