---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 바이브코딩 플레이북

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## AI 작업의 목적

AI는 공식 문서를 대체하는 설계자가 아니라, 이미 승인된 M3 Web 계약을 React/Base UI 구조로 번역하는 구현자다. 빠른 생성보다 source traceability, 실제 동작, 접근성, 일관된 token 소비가 우선이다.

## 모든 프롬프트에 넣을 필수 규칙

```text
https://m3.material.io/develop/web 및
https://github.com/material-components/material-web/tree/main/docs 가
이 구현의 최상위 Web 기술 스펙이다.

작업 대상 컴포넌트의 Material Web Usage, Accessibility, Theming, API 문서를
먼저 확인하고 사용한 URL을 결과에 명시한다. Base UI, 기존 코드, 테스트,
추정 또는 생성 결과가 공식 문서와 충돌하면 구현하지 말고
M3_WEB_SPEC_CONFLICT로 보고한다.

Material Web main 문서와 v2.5.0 commit
b4de401eb665ec63474f39319a4ba8f2145974cc 의 문서를 함께 대조한다.
M3 Expressive와 Material Web Labs는 제품 코드에 구현하지 않는다.
```

## 작업 단위

한 작업은 다음 중 하나만 담당한다.

- token 한 계층
- Theme Runtime 한 흐름
- interaction primitive 하나
- 공개 컴포넌트 하나
- 한 컴포넌트의 준수·테스트 보강

“전체 디자인 시스템을 한 번에 구현”하는 프롬프트를 사용하지 않는다. 한 컴포넌트를 API부터 실제 앱 검증까지 세로로 완료한 뒤 다음 컴포넌트로 이동한다.

## Foundation 구현 프롬프트

```text
[필수 M3 Web 규칙을 여기에 삽입]

목표:
React 프로젝트의 src/ui에 M3 token 및 Theme Runtime 기반을 구현한다.

고정 결정:
- CSS Variables + CSS Modules
- @base-ui/react@1.7.0
- @material/material-color-utilities@0.4.0
- @material/web, lit, motion 설치 금지
- Theme variant는 TonalSpot만 지원
- Light/Dark/System, Standard=0.0, High=0.5
- seed preset: #6750A4, #00639B, #386A20, #8B5000
- Theme token은 document.documentElement에 원자적으로 적용
- storage key는 ui.theme.v1

필수 산출물:
- reference/system/component/state/motion token
- Color Engine adapter
- ThemeProvider/useTheme/UIProvider
- Vite bootstrap과 Next.js bootstrap 계약
- unit test와 Storybook token sheet
- 사용한 공식 URL과 M3ComplianceRecord

금지:
- component CSS의 raw color/radius/shadow/duration
- theme role 일부만 교체
- hydration 후에만 dark mode 적용
- Expressive spring 또는 shape morph 구현
```

## 컴포넌트 구현 프롬프트 템플릿

```text
[필수 M3 Web 규칙을 여기에 삽입]

작업 대상: <Component>
M3 문서: <m3-component-url>
Material Web main: <main-doc-url>
Material Web snapshot: <commit-pinned-url>
Base UI primitive: <primitive>

목표:
공식 문서의 anatomy, variants, usage, accessibility, theming 및 API semantics를
React public API와 CSS Modules로 구현한다.

필수 절차:
1. 저장소의 token, interaction primitive, 공개 export 관례를 읽는다.
2. main과 snapshot 문서의 차이를 확인한다.
3. 구현 전에 public props와 state matrix를 제시한다.
4. Base UI primitive를 src/ui 내부에서만 사용한다.
5. component token을 system token에 매핑한다.
6. StateLayer, Ripple, FocusRing을 공통 구현으로 사용한다.
7. Storybook interaction, unit/a11y test, 실제 앱 대표 흐름을 검증한다.
8. M3ComplianceRecord를 PASS 또는 BLOCKED로 작성한다.

완료 증거:
- 실제 사용 경로
- 적용 token 목록
- 상태와 keyboard 동작
- Light/Dark/High/reduced-motion 결과
- 실행한 검증과 결과
- 남은 M3_WEB_SPEC_CONFLICT
```

## 컴포넌트별 확인 포인트

### Button

- elevated/filled/tonal/outlined/text variant
- leading/trailing icon 배치
- native button/form semantics
- disabled focus와 state layer
- icon-only 사용 금지

### IconButton

- standard/filled/tonal/outlined
- `aria-label` 필수
- toggle과 `aria-pressed`
- selected icon과 unbounded ripple
- default stable Web size

### TextField

- filled/outlined
- label association
- supporting/error text와 `aria-describedby`
- native validation/form reset
- prefix/suffix와 icon slot

### Checkbox

- label과 hit target
- checked/unchecked/indeterminate
- Space keyboard interaction
- native form value
- disabled feedback 억제

### Select

- filled/outlined visual family
- required/error/supporting text
- highlighted와 selected 분리
- arrow/Home/End/typeahead/Enter/Escape
- form value와 Portal Theme

### Dialog

- modal/backdrop
- name/description
- initial/final focus와 focus trap
- Escape/backdrop dismiss 정책
- 긴 content scrolling과 action 유지

### Menu

- item/checkbox/radio/submenu
- keyboard/typeahead
- highlighted/checked/disabled
- collision·positioning
- 선택·닫힘 후 focus 복원

### Snackbar

- Material Web 문서 부재를 `unavailable`로 기록
- M3 Snackbar URL 사용
- message와 단일 action
- loading은 timeout 0, 같은 id update
- type별 임의 색상 variant 금지
- live region, F6 navigation, pause/dismiss 검증

## 검증 전용 프롬프트

```text
[필수 M3 Web 규칙을 여기에 삽입]

다음 구현을 수정하지 말고 M3 Web 준수 관점에서 감사한다.

검토 순서:
1. 현재 구현의 실제 공개 진입점과 Base UI primitive를 추적한다.
2. Material Web main/snapshot의 Usage, Accessibility, Theming, API와 비교한다.
3. anatomy, color, type, shape, size, elevation, state, ripple, focus, motion,
   accessibility를 각각 PASS/BLOCKED로 판정한다.
4. Storybook이나 테스트가 실제 동작과 다르면 TEST DRIFT로 보고한다.
5. 공식 Web 미지원 Expressive/Labs 사용을 찾는다.

출력:
- 결론과 실제 사용자 영향
- M3_WEB_SPEC_CONFLICT 목록
- source URL
- 재현 절차
- 최소 수정 범위
- M3ComplianceRecord 초안
```

## 코드 리뷰 금지 패턴

```text
@material/web import
lit import
Base UI direct import outside src/ui
raw hex in component CSS
raw box-shadow or border-radius in component CSS
raw milliseconds/cubic-bezier in component CSS
outline: none without a replacement focus indicator
hover-only feedback
aria-label copied from visible text without product meaning review
setTimeout used to approximate popup lifecycle
querySelector used to repair Base UI focus management
M3 Expressive or labs code in the stable export
```

## AI 결과 제출 형식

```markdown
## Outcome
실제 사용자에게 도달한 결과

## Authority
- M3 Web: URL
- M3 Component: URL
- Material Web main: URL
- Material Web snapshot: URL
- Base UI primitive: URL

## Implementation
- Public API
- Token mappings
- State/keyboard/focus behavior

## Verification
- Unit
- Component/a11y
- Storybook
- Representative app flow
- Light/Dark/High/reduced motion

## Compliance
- main vs snapshot difference
- M3_WEB_SPEC_CONFLICT: none | list
- M3ComplianceRecord: PASS | BLOCKED
```

## 리뷰어 체크리스트

- [ ] AI가 작업 전에 공식 문서를 읽었다.
- [ ] source URL이 구체적인 파일/컴포넌트 페이지를 가리킨다.
- [ ] Base UI 예제를 최종 디자인으로 복사하지 않았다.
- [ ] Material Web DOM/API를 React에 기계적으로 복제하지 않았다.
- [ ] documented variant와 state만 공개했다.
- [ ] 실제 앱 진입점에서 검증했다.
- [ ] 테스트가 현재 구현을 보호하는 대신 상위 계약을 검증한다.
- [ ] `M3ComplianceRecord`가 증거와 일치한다.
