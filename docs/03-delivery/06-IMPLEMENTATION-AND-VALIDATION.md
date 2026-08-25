---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 구현 순서와 검증 계획

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 단계 0 — Baseline 고정

산출물:

- Material Web `docs@main` 문서 목록
- v2.5.0 commit 고정 URL
- `spec-baseline.ts`
- 8개 컴포넌트의 빈 `M3ComplianceRecord`

완료 게이트:

- 모든 MVP 컴포넌트에 공식 M3 URL이 있다.
- Material Web 대응 유무가 기록되어 있다.
- Snackbar의 `unavailable`과 대체 공식 근거가 명시되어 있다.
- Expressive와 Labs가 `deferred` 또는 금지로 분류되어 있다.

## 단계 1 — 프로젝트 경계와 CSS 기반

작업:

- 의존성 설치와 lockfile 고정
- Node.js 24.x/pnpm 10.33.x runtime readback
- Vite 실제 진입점과 host-neutral `src/ui` 경계
- `src/ui` 공개 export 생성
- Base UI/Material Web import restriction
- CSS layer, reset, root stacking context
- Storybook과 테스트 환경 연결

완료 게이트:

- 애플리케이션 화면에서 Base UI 직접 import가 lint 실패한다.
- Node.js 24에서 install, lint, typecheck, build가 통과한다.
- 빌드 산출물에 `@material/web`과 `lit`가 없다.
- app root와 Portal root가 같은 system token을 상속한다.

## 단계 2 — 토큰

작업:

- reference/system/component token 작성
- color, typography, shape, elevation, state, motion 분리
- token 이름과 Material Web/M3 source 매핑
- reduced motion override

완료 게이트:

- token graph에 순환 참조가 없다.
- component CSS의 raw HEX, shadow, radius, duration을 정적 검사한다.
- 대표 Light/Dark token sheet를 렌더한다.

## 단계 3 — Theme Runtime

작업:

- MCU adapter와 role extractor
- preset과 custom seed
- mode/contrast resolution
- storage, cache, fallback, bootstrap
- ThemeProvider와 `useTheme`

완료 게이트:

- 네 프리셋과 두 mode의 golden role fixture가 있다.
- invalid seed/storage에서 안전한 fallback을 확인한다.
- System mode가 OS 변경을 반영한다.
- hydration 전후 computed `color-scheme`이 일치한다.
- Dialog Portal에서 변경된 seed의 role이 보인다.

## 단계 4 — Interaction primitive

작업 순서:

1. StateLayer
2. FocusRing
3. bounded/unbounded Ripple
4. overlay opening/closing motion
5. reduced motion

완료 게이트:

- pointer와 keyboard press가 올바른 위치에서 feedback을 만든다.
- `pointercancel` 후 pressed/ripple이 남지 않는다.
- focus-visible이 hover/press와 독립적으로 보인다.
- disabled는 interactive feedback을 만들지 않는다.
- reduced motion에서 의미를 유지하고 공간 이동은 제거된다.

## 단계 5 — 컴포넌트 세로 슬라이스

구현 순서:

1. Button
2. IconButton
3. TextField
4. Checkbox
5. Select
6. Menu
7. Dialog
8. Snackbar

각 컴포넌트는 다음 세로 슬라이스를 한 번에 끝낸다.

```text
official source review
→ public API
→ Base UI adapter
→ component token
→ visual and interaction implementation
→ Storybook state matrix
→ unit/a11y tests
→ representative app flow
→ M3ComplianceRecord PASS
```

구현만 먼저 쌓고 compliance와 테스트를 나중에 일괄 작성하지 않는다.

## 단계 6 — Theme 설정 UI

작업:

- 프리셋 선택
- HEX/color picker 입력
- Light/Dark/System
- Standard/High contrast
- Preview/Apply/Reset
- storage readback

완료 게이트:

- Preview는 저장하지 않는다.
- Apply 후 reload에서 같은 Theme이 복원된다.
- invalid HEX가 기존 Theme을 손상시키지 않는다.
- Theme 변경 중 Dialog/Menu/Snackbar의 role 불일치 프레임이 없다.

## 테스트 계층

### Unit

- color role 생성과 CSS variable 이름 변환
- storage parse/version/fallback
- mode와 contrast resolution
- controlled/uncontrolled component state
- snackbar manager add/update/dismiss
- ripple geometry와 cleanup

### Component interaction

- Testing Library와 `user-event` 사용
- role/name 기반 query 우선
- keyboard, pointer, focus, form submit/reset
- Portal은 실제 document body에 렌더
- axe 위반 검사

### Storybook

각 컴포넌트에 다음 story를 최소 제공한다.

- 모든 documented variant
- enabled/hover/focus/pressed/disabled
- selected/checked/error 등 적용 가능한 상태
- Light/Dark
- Standard/High contrast
- long label과 좁은 viewport
- reduced motion

상태를 강제로 꾸며 놓은 story만 만들지 않고 `play` interaction으로 실제 상태에 진입하는 story를 포함한다.

### Representative E2E

1. Theme picker에서 custom seed를 preview하고 적용한 뒤 reload한다.
2. 키보드로 Select를 열고 option을 선택한다.
3. Menu와 submenu를 탐색하고 trigger로 focus가 복원되는지 확인한다.
4. Dialog를 열고 focus trap, Escape/backdrop 정책, final focus를 확인한다.
5. TextField validation error와 described-by 연결을 확인한다.
6. Snackbar action을 실행하고 동일 id update를 확인한다.

### Visual regression

Viewport: 375×812, 768×1024, 1440×900.

Theme 조합은 모든 조합의 Cartesian product 대신 다음 대표 쌍을 고정한다.

- Material Purple / Light / Standard
- Ocean / Dark / Standard
- Forest / Light / High
- Sunset / Dark / High
- 고채도 custom seed / Light
- 저채도 custom seed / Dark

## 정적 정책 검사

실패 조건:

- `src/ui` 밖에서 `@base-ui/react` import
- 모든 위치에서 `@material/web` 또는 `lit` import
- component module의 raw HEX
- component module의 raw `box-shadow`, radius, duration, cubic-bezier
- `outline: none` 뒤 대체 focus indicator 없음
- `M3_WEB_SPEC_CONFLICT`가 열린 상태
- 공식 URL 또는 확인일 없는 compliance record

## 완료 체크리스트

- [ ] 8개 공개 컴포넌트가 `src/ui/index.ts`에서 export된다.
- [ ] 모든 컴포넌트에 main/snapshot source가 연결된다.
- [ ] Material Web 문서가 없는 항목은 대체 공식 근거가 있다.
- [ ] Theme 변경이 Portal까지 원자적으로 반영된다.
- [ ] state layer, ripple, focus, motion이 공통 primitive를 사용한다.
- [ ] reduced motion과 forced colors를 확인했다.
- [ ] keyboard 대표 흐름을 실제 브라우저에서 통과했다.
- [ ] Storybook만이 아니라 앱 진입점 흐름이 통과했다.
- [ ] 모든 `M3ComplianceRecord`가 `PASS`다.

## 기존 프로젝트 도입

1. 새 `src/ui`를 추가하고 기존 컴포넌트는 즉시 삭제하지 않는다.
2. Provider와 global token부터 연결한다.
3. 신규 화면은 새 UI만 사용한다.
4. 기존 화면은 Button → form control → overlay 순서로 교체한다.
5. 화면 단위로 실제 흐름을 검증한 후 legacy import를 제거한다.
6. legacy 스타일을 제거하기 전 repository 전체 사용처를 확인한다.

도입 중 기존 구현과 새 구현이 같은 화면에 공존하면 token은 하나의 ThemeProvider에서 공급하고 overlay provider는 중복 배치하지 않는다.
