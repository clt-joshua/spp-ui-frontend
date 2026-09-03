---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# Material Web 문서 적용 지도

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 상태 정의

| 상태 | 의미 |
|---|---|
| `required` | 현재 MVP 구현 전에 반드시 읽고 준수 |
| `supporting` | 공통 정책 또는 시각 비교 근거 |
| `deferred` | MVP에는 없지만 향후 확장 시 필수 |
| `not-applicable` | 현재 기술 결정에는 적용하지 않으며 이유 기록 |
| `unavailable` | Material Web 문서에 대응 항목이 없어 다른 공식 근거 필요 |

## 공통 개발 문서

| 라이브 문서 | 상태 | 적용 위치 | 결정 |
|---|---|---|---|
| [`docs/intro.md`](https://github.com/material-components/material-web/blob/main/docs/intro.md) | `required` | 목표·아키텍처 | Material component와 token 개념을 채택 |
| [`docs/quick-start.md`](https://github.com/material-components/material-web/blob/main/docs/quick-start.md) | `supporting` | 설정 | ESM과 tree-shaking 방향은 적용, custom element 설치법은 미적용 |
| [`docs/roadmap.md`](https://github.com/material-components/material-web/blob/main/docs/roadmap.md) | `required` | 준수·ADR | 유지보수 모드, 미구현 컴포넌트, TSX·motion·density 공백을 명시 |
| [`docs/support.md`](https://github.com/material-components/material-web/blob/main/docs/support.md) | `required` | 설정·검증 | 브라우저 범위, dark mode 적용 책임, system token 사용을 반영 |
| [`docs/size.md`](https://github.com/material-components/material-web/blob/main/docs/size.md) | `supporting` | 컴포넌트·검증 | resize와 레이아웃 측정이 필요한 overlay/control에 반영 |
| [`docs/sass/sass-ext.md`](https://github.com/material-components/material-web/blob/main/docs/sass/sass-ext.md) | `not-applicable` | 설정 | CSS Modules를 선택했으므로 Sass API는 사용하지 않음 |

## Theming 문서

| 라이브 문서 | 상태 | 적용 위치 | 결정 |
|---|---|---|---|
| [`docs/theming/README.md`](https://github.com/material-components/material-web/blob/main/docs/theming/README.md) | `required` | 토큰 | reference → system → component 계층 고정 |
| [`docs/theming/color.md`](https://github.com/material-components/material-web/blob/main/docs/theming/color.md) | `required` | Theme Runtime | Light/Dark color role과 MCU 사용 |
| [`docs/theming/shape.md`](https://github.com/material-components/material-web/blob/main/docs/theming/shape.md) | `required` | 토큰·컴포넌트 | system shape를 component token에 매핑 |
| [`docs/theming/typography.md`](https://github.com/material-components/material-web/blob/main/docs/theming/typography.md) | `required` | 토큰·컴포넌트 | typeface와 typescale role 사용 |

Material Web 문서는 reference palette와 system motion token을 완전한 공개 테마 API로 제공하지 않는다. 이 공백은 Material Web 내부 구현을 무단 확장하지 않고 관련 M3 공식 문서 및 안정 token snapshot으로만 보완한다.

## 공통 primitive 문서

| 라이브 문서 | 상태 | 프로젝트 대응 |
|---|---|---|
| [`ripple.md`](https://github.com/material-components/material-web/blob/main/docs/components/ripple.md) | `required` | `Ripple`, bounded/unbounded, press 위치, token |
| [`focus-ring.md`](https://github.com/material-components/material-web/blob/main/docs/components/focus-ring.md) | `required` | `FocusRing`, inward/outward, focus-visible |
| [`elevation.md`](https://github.com/material-components/material-web/blob/main/docs/components/elevation.md) | `required` | overlay와 elevated variant의 elevation token |
| [`icon.md`](https://github.com/material-components/material-web/blob/main/docs/components/icon.md) | `supporting` | Icon wrapper와 accessible name 정책 |

## 공개 컴포넌트 문서

| 프로젝트 컴포넌트 | Material Web 문서 | 필수 검토 섹션 | 상태 |
|---|---|---|---|
| Button | [`button.md`](https://github.com/material-components/material-web/blob/main/docs/components/button.md) | Types, Usage, Accessibility, Theming, API | `required` |
| IconButton | [`icon-button.md`](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md) | Types, Links, Toggle, Accessibility, Theming, API | `required` |
| TextField | [`text-field.md`](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md) | Input type, Label, Textarea, Icons, Supporting text, Validation, Accessibility | `required` |
| Checkbox | [`checkbox.md`](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md) | Usage, Label, Accessibility, Theming, API | `required` |
| Radio | [`radio.md`](https://github.com/material-components/material-web/blob/main/docs/components/radio.md) | Usage, Label, Accessibility, Theming, form and group API | `required` |
| Tabs | [`tabs.md`](https://github.com/material-components/material-web/blob/main/docs/components/tabs.md) | Types, Selection, Accessibility, Tab panels, Theming, API | `required` |
| Switch | [`switch.md`](https://github.com/material-components/material-web/blob/main/docs/components/switch.md) | Usage, Icons, Selected, Form fields, Accessibility, Theming, API | `required` |
| SegmentedButton | 공개 문서 없음; [Labs segment source](https://github.com/material-components/material-web/blob/main/labs/segmentedbutton/internal/segmented-button.ts), [Labs set source](https://github.com/material-components/material-web/blob/main/labs/segmentedbuttonset/internal/segmented-button-set.ts) 보조 검토 | group/button semantics, single/multiple selection, disabled, checkmark, touch target | `unavailable` |
| Chip | [`chip.md`](https://github.com/material-components/material-web/blob/main/docs/components/chip.md) | Types, Chip sets, Accessibility, Assist/Filter/Input, Theming, API | `required` |
| Select | [`select.md`](https://github.com/material-components/material-web/blob/main/docs/components/select.md) | Usage, Required, Accessibility, Theming, option API | `required` |
| Dialog | [`dialog.md`](https://github.com/material-components/material-web/blob/main/docs/components/dialog.md) | Opening/closing, Return value, Alerts, Accessibility, Theming | `required` |
| Menu | [`menu.md`](https://github.com/material-components/material-web/blob/main/docs/components/menu.md) | Usage, Submenu, positioning, Accessibility, Theming | `required` |
| Snackbar | 대응 문서 없음 | M3 Snackbar 및 Base UI Toast 접근성 | `unavailable` |

## 향후 확장 문서

| 문서 | 상태 | 활성화 조건 |
|---|---|---|
| [`divider.md`](https://github.com/material-components/material-web/blob/main/docs/components/divider.md) | `deferred` | Divider 추가 |
| [`fab.md`](https://github.com/material-components/material-web/blob/main/docs/components/fab.md) | `deferred` | FAB 추가 |
| [`list.md`](https://github.com/material-components/material-web/blob/main/docs/components/list.md) | `deferred` | List 추가 |
| [`progress.md`](https://github.com/material-components/material-web/blob/main/docs/components/progress.md) | `deferred` | Progress 추가 |
| [`slider.md`](https://github.com/material-components/material-web/blob/main/docs/components/slider.md) | `deferred` | Slider 추가 |

## 이미지와 figure 자산

`docs/components/images/**`와 `docs/components/figures/**`는 시각·사용 예시 비교용 `supporting` 자료다. HTML figure의 DOM 구조를 React 구현에 복사하지 않으며, 이미지와 figure만으로 스펙을 추론하지 않는다. 관련 Markdown의 텍스트·접근성·Theming/API 설명을 우선한다.

## 고정 스냅샷 규칙

라이브 URL의 `main`을 다음 commit으로 바꾼 URL이 재현 기준이다.

```text
https://github.com/material-components/material-web/blob/
b4de401eb665ec63474f39319a4ba8f2145974cc/docs/<path>
```

컴포넌트 작업 결과에는 라이브 URL과 snapshot URL을 둘 다 기록한다. 라이브 문서 변경이 발견되면 영향 분석 없이 snapshot을 덮어쓰지 않는다.
