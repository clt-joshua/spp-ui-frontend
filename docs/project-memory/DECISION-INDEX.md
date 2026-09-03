# 결정 인덱스

승인된 결정의 본문 권위는 [목표와 아키텍처 결정](../01-product/02-GOALS-AND-DECISIONS.md)에 있다. 이 파일은 탐색용 요약이다.

| ID | 결정 | 구현 영향 |
|---|---|---|
| ADR-001 | Base UI를 headless 기반으로 사용 | ARIA, keyboard, focus, dismiss, positioning은 내부 adapter에서 사용 |
| ADR-002 | Material Web은 참조 전용 | `@material/web`과 `lit`를 runtime에 설치·import하지 않음 |
| ADR-003 | 앱 내부 `src/ui`에서 시작 | 별도 npm package보다 내부 public index를 먼저 안정화 |
| ADR-004 | CSS Variables + CSS Modules | 전역 token과 컴포넌트 selector 책임을 분리 |
| ADR-005 | Stable M3 Web만 제품 기준 | Expressive와 Labs는 `deferred` |
| ADR-006 | static preset + runtime seed | 초기 렌더 안정성과 custom seed를 함께 지원 |
| ADR-007 | 앱 API에 Base UI 타입을 노출하지 않음 | library update와 제품 API를 격리 |
| ADR-008 | 대표 실제 흐름이 완료 증거 | Storybook/단위 테스트만으로 PASS 금지 |
| ADR-009 | Vite 대표 host + 범용 `src/ui` | 실제 앱은 Vite, UI 공개 경계에는 Vite runtime 의존 금지 |
| ADR-010 | Node.js 24 runtime baseline | Node 24.x, pnpm 10.33.x, lockfile과 CI major 일치 |
| ADR-011 | Material Icons + 교체 가능한 Noto Sans | self-hosted 기본 자산을 adapter와 reference font 변수로 격리; Figma 34 Text Style metric 적용 |
| ADR-012 | GitHub Actions quality + 3-browser E2E | Linux visual gate 폐기, quality/e2e blocking, failure artifact 14일 |
| ADR-013 | Theme Lab + Component Verification 실제 진입점 | `/` 제품 흐름과 `/components` 전체 state inventory에서 10개 MVP + Tabs·Switch·Segmented Button 확장과 Portal을 검증 |
| ADR-014 | Figma spatial·elevation foundation을 계층형 token으로 사용 | 18 number → 18 space/17 gap/8 radius, 5 elevation style → component token; M3 독립 geometry는 근사 금지 |
| ADR-015 | Segmented Button Figma density + MD3 selection | 32px Figma 시각 token, native button/aria-pressed, single 비해제, multiple toggle, Labs runtime 비의존 |

## 고정 기술 계약

| 항목 | 값 |
|---|---|
| Base UI | `@base-ui/react@1.7.0` |
| Color engine | `@material/material-color-utilities@0.4.0` |
| 대표 host | Vite 8 + React 19 + TypeScript |
| Runtime | Node.js 24.x + pnpm 10.33.x |
| 기본 아이콘 | Google Material Icons Filled, self-hosted |
| 기본 서체 | Noto Sans Variable, `--app-font-brand`/`--app-font-plain`으로 교체 |
| Material Web baseline | `v2.5.0`, commit `b4de401eb665ec63474f39319a4ba8f2145974cc` |
| 스타일 | CSS Variables + CSS Modules |
| Theme variant | `TonalSpot` |
| Theme mode | Light / Dark / System |
| Contrast | Standard `0.0` / High `0.5` |
| Public components | Button, IconButton, TextField, Checkbox, Radio, Tabs, Switch, SegmentedButton, Chip, Select, Dialog, Menu, Snackbar |

새 결정은 임시로 이 표에만 추가하지 말고, 먼저 ADR 또는 해당 계약 문서에 기록한 뒤 인덱스를 갱신한다.
