---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 컴포넌트와 인터랙션 계약

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 공통 구현 원칙

- Base UI primitive의 ARIA, keyboard, focus, dismiss, positioning semantics를 보존한다.
- Material Web 문서의 Usage, Accessibility, Theming, API를 React wrapper 계약으로 번역한다.
- Material Web custom element의 태그·이벤트 이름을 그대로 모방하지 않는다.
- 내부 slot은 `data-slot`, state는 `data-*`로 식별하되 공개 계약으로 문서화한 값만 안정성을 보장한다.
- 모든 interactive root는 StateLayer와 FocusRing을 사용하고, press feedback이 필요한 variant는 Ripple을 사용한다.
- 단순 CSS hover 색상 변경으로 state layer를 대체하지 않는다.

## StateLayer

```ts
interface StateLayerProps {
  color: string;
  disabled?: boolean;
  hovered?: boolean;
  focused?: boolean;
  pressed?: boolean;
  dragged?: boolean;
}
```

상태 우선순위는 disabled가 최상위다. 그 외 상태는 동시에 존재할 수 있으며 selection은 container/content token 변경, interaction은 state layer 변경으로 분리한다. layer는 pointer event를 받지 않고 root의 shape에 맞춰 clip된다.

```css
.stateLayer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: var(--md3-state-layer-color, currentColor);
  opacity: 0;
}

.root:hover .stateLayer {
  opacity: var(--md-sys-state-hover-state-layer-opacity);
}

.root:focus-visible .stateLayer {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}

.root[data-pressed] .stateLayer {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}
```

## Ripple

```ts
interface RippleOptions {
  bounded?: boolean;
  centered?: boolean;
  disabled?: boolean;
}

interface RippleController {
  start(event?: PointerEvent | KeyboardEvent): number | null;
  end(id?: number): void;
  cancel(id?: number): void;
}
```

- pointer activation은 local pointer 위치를 중심으로 가장 먼 모서리를 덮는 반지름을 계산한다.
- keyboard activation은 중앙에서 시작한다.
- IconButton처럼 공식 문서가 unbounded 사용을 허용하는 경우만 root 밖으로 확장한다.
- `pointerup`, `pointercancel`, blur와 disabled 전환에서 종료한다.
- primary pointer만 수락하며 새 press는 이전 grow를 교체한다. 여러 동심 wave를 누적하지 않는다. mouse/pen pointerleave도 release한다.
- 애니메이션 종료 후 DOM node를 제거한다.
- reduced motion에서도 Material Web의 입력 피드백과 동일하게 ripple을 제거하지 않는다.
- ripple element는 accessibility tree와 hit testing에서 제외한다.
- keyboard ripple은 실제 click에 반응한다. 일반 native button은 Space keyup, Tabs는 공식 tab처럼 keydown에 활성화된다. forced-colors에서는 ripple을 생성/표시하지 않는다.

## FocusRing

- `:focus-visible`에서만 기본 indicator를 표시한다.
- component shape를 따르며 문서가 요구하는 inward/outward 방식을 구분한다.
- outline thickness와 offset은 token으로 관리한다.
- Windows forced colors에서 `CanvasText` 또는 system highlight가 보이도록 fallback한다.
- focus indicator는 ripple, border, active indicator와 독립적이어야 한다.
- outward outline / inward border를 0→8px 150ms, 8→3px 450ms emphasized로 전환한다. reduced-motion에서는 3px 정적 ring을 유지한다.

## Motion

- visibility 전환은 Base UI의 `data-starting-style`, `data-ending-style`에 CSS transition을 연결한다.
- opening과 closing 도중 방향이 바뀌어도 현재 computed state에서 부드럽게 취소·역전되어야 한다.
- opacity와 transform만으로 의미가 충분한 overlay에 layout animation을 추가하지 않는다.
- motion token 밖의 duration/easing을 사용하지 않는다.
- reduced motion은 component authority별로 적용한다. Stable Material Web이 별도 reduced-motion 분기를 두지 않는 ripple grow/fade, field·selection 상태 전환, `quick=false` Menu/Select 전환은 동일하게 유지하며, 임의의 전역 `0ms` override를 추가하지 않는다.
- Expressive spring/shape morph는 `deferred`; 이를 흉내 낸 임의 easing을 만들지 않는다.
- 최신 component별 기준과 source revision은 [마이크로 모션 감사](../audits/2026-09-07-micro-motion/README.md)를 따른다. Switch의 overshoot는 Stable 소스 자체의 easing이며 Expressive spring 도입이 아니다. Dialog는 공식처럼 실제 surface height를 전환해 shadow를 보존한다.

## Typography role 사용 계약

컴포넌트는 Figma Text Style의 숫자를 selector에 복사하지 않는다. `component.css`에서 하나의 system role을 선택하고 `font`, `size`, `line-height`, `weight`, `tracking`, `decoration` 6개를 같은 role에서 매핑한 뒤 CSS Module은 그 component token만 소비한다. 밑줄 role은 링크 또는 명시적인 underlined anatomy처럼 decoration이 요구되는 경우에만 선택하며, 기본 role에 selector 수준의 `text-decoration`을 임의 추가하지 않는다.

| System role | 현재 component anatomy |
|---|---|
| `label-large` | Button large label, Chip large label, Snackbar action |
| `label-large-prominent` | Primary Tab label |
| `label-medium` | Button medium/small label, Chip small label와 Location value |
| `label-medium-prominent` | Location prefix |
| `label-small` | Chip x-small label |
| `body-large` | Checkbox/Radio label, TextField large input/resting label, Select trigger/value/resting label/option, Menu item |
| `body-medium` | Checkbox/Radio supporting text, Dialog supporting text, Snackbar message |
| `body-small` | TextField outlined-small input, large active label, TextField/Select supporting/error text와 Select active label |
| `headline-small` | Dialog headline |

새 컴포넌트는 먼저 semantic anatomy에 맞는 system role을 선택하고 component token surface를 추가한다. 강조는 같은 크기에 weight만 덮어쓰지 않고 `*-prominent` role을, 밑줄은 `*-underline` role을 사용한다. 전체 34개 원본 값과 정규화 규칙은 [Typography token](04-TOKENS-AND-DYNAMIC-THEME.md#typography-token)에 있다.

## Spatial·shape·elevation token 사용 계약

Figma 원본 값과 전체 scale은 [Figma spatial foundation](04-TOKENS-AND-DYNAMIC-THEME.md#figma-spatial-foundation)과 [Figma elevation effect styles](04-TOKENS-AND-DYNAMIC-THEME.md#figma-elevation-effect-styles)을 따른다. 컴포넌트 구현에는 다음 규칙을 적용한다.

1. padding, margin, inset은 `component token → --md-sys-space-*`로 매핑한다.
2. flex/grid 형제 사이의 `gap`은 `component token → --md-sys-gap-*`로 매핑한다. 같은 숫자여도 space와 gap을 의미 없이 교환하지 않는다.
3. corner radius는 component anatomy가 M3 compatibility role을 요구하면 `--md-sys-shape-corner-*`, 프로젝트 고유 anatomy가 Figma scale을 직접 선택하면 `--md-sys-radius-*`를 component token에서 참조한다.
4. elevation은 `--md-<component>-container-elevation → --md-sys-elevation-level*`로 선택하고 selector에서는 component token만 소비한다.
5. Figma scale에 없는 값을 가장 가까운 step으로 반올림하지 않는다. Stable M3 Dialog 28px shape, 18px icon, 1px/3px outline처럼 독립 계약인 geometry는 별도 component/compatibility token으로 보존한다.
6. CSS Module은 `--md-ref-number-*`, `--md-sys-space-*`, `--md-sys-gap-*`, `--md-sys-radius-*`를 직접 참조하지 않는다. 새 값이 필요하면 먼저 component token을 추가하고 anatomy와 source를 문서화한다.

현재 연결 예시:

| Component | Component token | System source |
|---|---|---|
| Button | `--md-button-large/medium/small-horizontal-space` | `--md-sys-space-250/200/150` (20/16/12px) |
| IconButton | `--md-icon-button-container-shape` | `--md-sys-shape-corner-full` → `radius/full` |
| Checkbox | `--md-checkbox-*-container/state-layer-size`, `--md-checkbox-state-layer-shape` | `space/150…450`, `radius/full` |
| Radio | `--md-radio-*-icon/state-layer-size`, `--md-radio-state-layer-shape` | `space/200…450`, `radius/full` |
| Tabs | `--md-primary-tab-horizontal/vertical-space`, `--md-primary-tab-content-gap` | `space/200`, `space/125`, `gap/25` |
| Switch | `--md-switch-track/handle/state-layer-size`, `--md-switch-track-shape` | Figma small 32×18px track, 12px handle, 24px state layer, `radius/full` |
| Chip | `--md-chip-*-container-height`, `--md-assistive-chip-container-shape` | `space/250…400`, `radius/xs` |
| Location Chip | `--md-location-chip-content-gap`, `--md-location-chip-container-shape` | `gap/75`, `radius/xxs` |
| TextField / AutoComplete | size별 control/input space | 0px gap + component slot padding |
| Select | `--md-select-text-field-vertical-space` | `--md-sys-space-100` (8px) |
| Menu | `--md-menu-item-content-gap` | `--md-sys-gap-200` (16px) |
| Dialog | `--md-dialog-container-padding`, `--md-dialog-content-gap` | `space/300`, `gap/200` |
| Snackbar | viewport/container/action spacing token | `space/50…200`, `gap/100` |
| Elevated surface | Button/Menu/Dialog/Snackbar elevation token | `--md-sys-elevation-level1…3` |

값 변경은 system scale을 selector에서 덮어쓰는 방식이 아니라 component token override로 수행한다. 한 컴포넌트에서 의도적으로 다른 spacing이 필요하면 instance root의 component custom property만 재정의한다.

## Button

공식 근거: [M3 Buttons](https://m3.material.io/components/buttons/overview), [Material Web Buttons](https://github.com/material-components/material-web/blob/main/docs/components/button.md)

프로젝트 시각 권위는 Figma `button` component set `10429:72459`다. Figma의 360개 조합은 `size(3) × style(5) × state(5) × error(2)`에 style별 content type을 곱한 결과다. Stable Material Web의 native button semantics, form association, focus, ripple과 실제 입력 상태를 유지하면서 Figma의 size, color, spacing, typography를 component token으로 적용한다.

```ts
type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
type ButtonSize = 'large' | 'medium' | 'small';

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
```

- 기본값은 `variant="filled"`, `size="large"`다.
- variant는 강조 순서와 작업 의미로 선택한다. Filled는 흐름을 완료하는 가장 중요한 최종 action, Tonal은 outline보다 강조가 필요한 중간 action, Outlined는 primary가 아닌 중요한 대안 action, Text는 여러 선택지 중 가장 낮은 우선순위 action에 사용한다. Elevated는 patterned/복잡한 배경에서 분리가 반드시 필요할 때만 제한적으로 사용한다.
- native button semantics와 form association을 보존한다.
- `enabled/hovered/focused/pressed/disabled`는 문서용 `state` prop이 아니라 native disabled와 실제 pointer·keyboard interaction으로 결정한다.
- Figma size anatomy는 large 40px/좌우 20px/icon 18px/gap 8px/`label-large`, medium 32px/16px/16px/4px/`label-medium`, small 24px/12px/16px/4px/`label-medium`다.
- medium/small의 visual container와 별도로 Material Web 방식의 48px touch target을 유지한다.
- style은 Filled, Outlined, Text, Elevated, Tonal 5종을 그대로 제공한다. Figma content matrix에서 모든 style은 text/left icon을 지원하고 right icon은 Outlined/Text에 정의되어 있다. 공개 API는 Stable Material Web의 trailing icon 호환성을 유지하되 한 instance에는 icon을 하나만 사용한다.
- `error`는 Figma의 시각 축이다. Filled는 error/on-error, Tonal은 error-container/on-error-container, Outlined는 error outline/label, Text/Elevated는 error label을 사용한다. 이는 input invalid semantics가 아니므로 `aria-invalid`를 자동 추가하지 않는다.
- disabled Filled/Tonal/Elevated는 surface-container-high + on-surface 38%, Text는 transparent + on-surface 38%를 사용한다. Outlined는 Figma 원본대로 Large에서 surface-container-lowest + surface-container-highest outline + outline-high label 100%, Medium/Small에서 surface-container-lowest + outline-middle + on-surface 38%를 사용한다. error 여부와 무관하게 disabled 표현을 우선한다.
- hover/focus wash는 Figma black 6%/12%를 유지한다. pressed는 전체 배경을 16%로 즉시 바꾸지 않고 Ripple만 사용한다. Light/Standard의 `--md-button-ripple-color`는 Figma pressed black 16%, `--md-button-ripple-opacity`는 1로 이미 포함된 alpha를 중복 곱하지 않는다. Dark/High에서는 전경색(`currentColor`)과 Material Web pressed opacity 10%를 사용한다. 이는 Light 원본 외 테마의 프로젝트 대응이다. 포인터 위치→중앙 확장, 실제 keyboard click의 중앙 시작, FocusRing과 pressed elevation은 유지한다.
- Filled/Tonal hover는 elevation 1, Elevated hover는 elevation 2로 올라가며 focus/pressed는 각 기본 elevation으로 복귀한다.
- icon-only action은 Button이 아니라 IconButton을 사용한다.
- disabled focus 정책은 Material Web Accessibility 문서와 Base UI 동작을 대조한다.
- loading은 M3 Button anatomy에 없는 확장이므로 MVP 공개 API에서 제외한다.

## IconButton

공식 근거: [M3 Icon buttons](https://m3.material.io/components/icon-buttons/overview), [Material Web Icon Buttons](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md)

```ts
type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined' | 'error';
type IconButtonSize = 'large' | 'medium' | 'small';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  selected?: boolean;
  selectedAriaLabel?: string;
  selectedIcon?: React.ReactNode;
  icon: React.ReactNode;
  'aria-label': string;
}
```

- 가시 label이 없으므로 접근 가능한 이름을 필수로 한다.
- toggle은 `selectedIcon`이 있을 때 `selected`와 `aria-pressed`를 동기화한다. 선택 전후 action 이름이 달라져야 하면 `selectedAriaLabel`을 사용한다.
- selected/unselected icon이 다르면 layout shift 없이 교체한다.
- Figma node `10724:16368`의 실행 component property를 따라 `large/medium/small`을 공개한다. 가이드 캡션의 `large/small/x-small`과 property 이름이 충돌하므로 실행 property 이름을 권위로 사용한다.
- visual container/icon/padding은 각각 large 40/24/8px, medium 32/20/6px, small 24/16/4px다. 모든 size에서 별도 48px touch target을 유지한다.
- style은 Stable Material Web의 standard/filled/filled tonal/outlined 4종과 Figma의 project-specific `error`를 제공한다. `error`는 action의 시각 강조이며 input invalid semantics가 아니므로 `aria-invalid`를 자동 추가하지 않는다.
- hover/focus는 Figma 6%/12% wash를 유지한다. pressed의 별도 전체 배경은 제거하고 Material Web처럼 현재 icon 전경색 10%의 Ripple만 사용한다. 포인터 입력은 실제 누른 위치에서 중앙으로 확장하고 keyboard click만 중앙에서 시작한다. 450ms grow/105ms fade-in/225ms 최소 표시/375ms fade-out 및 reduced-motion 입력 피드백을 유지한다. 이는 기존 Figma 정적 pressed 16%를 대체하는 사용자 승인 변경이며, hover/focus wash와 크기 등 Figma 시각 override까지 Material Web 기본값과 같다는 뜻은 아니다. transient state prop은 공개하지 않는다.
- disabled는 error/selected보다 우선한다. Standard는 transparent + on-surface icon 38%, Filled/Tonal/Error는 surface-container + on-surface icon 38%, Outlined는 surface-container-lowest + outline-middle + on-surface icon 38%다.
- `type`은 accidental form submission을 막기 위해 `button`이 기본이며, 소비자가 `submit`/`reset`을 명시할 수 있다.

## TextField

공식 근거: [M3 Text fields](https://m3.material.io/components/text-fields/overview), [Material Web Text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md), [Outlined text field 구현](https://github.com/material-components/material-web/blob/main/textfield/outlined-text-field.ts)

```ts
type TextFieldSize = 'large' | 'small';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'prefix' | 'size'> {
  size?: TextFieldSize; // large 48px / small 32px
  label: string;
  hideLabel?: boolean;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  trailingAction?: { icon: React.ReactNode; label: string; onClick: () => void };
  clearable?: boolean;
  clearLabel?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  rows?: number; // type="textarea"일 때 기본 2
}
```

- Figma `10724:14659`의 large set `10443:76121`, small set `10443:77309`가 outlined의 시각 권위다. `2 size × 2 input type × 7 state × 2 inputted = 56` 조합을 공개 `size`, native `type`, `value/defaultValue`, `error`, `disabled`, `readOnly`와 실제 hover/focus로 표현한다. 공개 `state`/`inputted` prop을 만들지 않는다.
- **현재 사용자 결정: Filled TextField와 variant API를 삭제한다.** 빈 값·비포커스에서는 내부 라벨, 포커스 또는 값이 있으면 상단 라벨을 150ms 측정 기반 모션으로 표시한다. 지우기는 포커스를 유지하므로 상단에 남고, 빈 상태로 blur하면 내부로 복귀한다. 이 결정이 원본 Figma pinned label보다 우선한다. 내부 라벨과 placeholder/affix를 동시에 표시해 겹치게 하지 않는다.
- Material Web `field.ts`/`_content.scss`를 기준으로 라벨은 실제 폭·중심 차이를 측정해 150ms standard로 이동한다. 진행 중 방향이 바뀌면 취소 전 transform/width를 다음 시작점으로 보존한다. 전환 중에는 floating label 하나만 그리며 완료 시 inline 표시 상태를 해제한다. 입력·placeholder·Prefix/Suffix는 한 content 그룹으로 67ms 뒤 83ms emphasized fade-in, blur 시 지연 없는 83ms fade-out을 사용한다. 고정 배경으로 notch를 순간 지우지 않고 기존 start/notch/end 패널을 전환한다. Material Web/Lit 런타임을 추가하지 않는다.
- label과 native input/textarea association을 유지한다. `hideLabel`은 시각만 숨기며 접근 가능한 이름을 제거하지 않는다. floating label/별표/장식 아이콘은 `aria-hidden`이고 placeholder는 이름의 대체가 아니다.
- 오류는 `aria-invalid`, 오류·설명은 외부 `aria-describedby`와 병합한다. native constraint validation의 `invalid` 이벤트는 실제 validationMessage 또는 errorText를 표시하며 입력/폼 reset으로 내부 오류를 해제한다. 앱이 제공한 `error`는 앱이 해제해야 한다.
- native `type`, `required`, `readOnly`, `disabled`, `min/max/step/pattern/maxLength`, name/value와 form reset을 보존한다. readOnly는 포커스·선택·복사·제출이 가능하고 disabled는 Tab과 제출에서 제외된다.
- Figma small의 text area 옵션과 Material Web의 공개 textarea 동작을 `type="textarea"`로 통합한다. 실제 `<textarea rows={2}>`와 세로 resize를 사용한다. source의 32px 한 줄 크기가 필요하면 `size="small" rows={1}`을 명시한다. 여러 줄을 32px 박스에 강제로 자르지 않는다.
- `leadingIcon`/`trailingIcon`은 장식이다. 동작이 필요하면 접근명과 실제 callback을 가진 `trailingAction`을 사용한다. trailingAction이 trailingIcon보다 우선하며 native `type=button`이다. readOnly의 비밀번호 표시 같은 비편집 action은 허용하되 값 변경을 금지할 책임은 callback 소비자에게 있다.
- `clearable`은 값이 있을 때 hover/focus-within(터치에서는 상시)에 지우기를 노출한다. Tab/Enter로 실행할 수 있고 native input event를 통해 controlled onChange를 정확히 한 번 호출하며 입력 포커스를 복원한다. disabled/readOnly에는 지우기가 없다.
- small 도움말은 Figma root bounds 밖의 절대 위치를 복제하지 않고 **32px control 아래 1px 간격의 문서 흐름**에 배치해 다음 필드와 겹치지 않게 한다.
- 모든 공간·문자·색상은 `--md-text-field-{large,small}-*`, `--md-text-field-figma-*` component token을 사용한다. raw Figma reference/system spatial token을 컴포넌트 CSS에서 직접 소비하지 않는다.
- 숫자는 small에서 오른쪽 정렬이다. large는 Figma 내부 text-right 속성이 hug wrapper에서 실질적인 우측 배치를 만들지 않으므로 실제 그래프의 시작 정렬을 보존한다. 기본 스피너 glyph만 숨기며 native ArrowUp/Down, min/max/step은 유지한다.
- 위치 glyph는 Figma의 outlined path를 사용하는 `MaterialIcon name="place_outline"`, 지우기는 Filled font의 `highlight_off`다. 비슷한 Filled `place`/`cancel`로 교체하지 않는다. 소비자가 아이콘 슬롯을 생략하거나 교체할 수 있다.
- 작은 크기는 조밀한 데스크톱 입력용이다. coarse pointer에서는 실제 control/outline와 action을 최소 48px로 늘린다. clear/trailing action의 hit region이 서로 겹치지 않도록 각 action 안에 둔다.
- character counter는 후속 slot이며 이번 Figma에는 없다. `maxLength`의 네이티브 제한은 유지한다.

| outlined 속성 | large | small |
|---|---|---|
| control / corner | 48px / 4px | 32px / 4px |
| 입력 / 라벨 / affix | body-large / body-small / label-large | body-small / label-small / label-medium |
| icon / action | 24px / 40px | 16px / 24px |
| label x / notch 좌우 padding | 16px / 4px | 8px / 2px |
| outline enabled / hover / focus | 1 / 2 / 3px | 1 / 2 / 2px |
| supporting top / inline | 4 / 12px | 1 / 8px |
| 오류 label | 빈 값·비포커스는 on-surface-variant, 값 있음 또는 포커스는 error | 항상 on-surface-variant |
| 오류 supporting | error | on-surface-variant |
| disabled | outline-high + root opacity 38%, error보다 우선 | 동일 |
| readonly | surface-container 배경, outline-middle | 동일 |

사용·검증 진입점: `/components#form-fields`의 32개 정적 상태와 실제 hover/focus로 56개 Figma 조합을 확인한다. 별도 실제 폼에서 필수값 오류, 숫자 입력, 비밀번호 표시, textarea, 지우기, readonly/disabled 제출과 reset을 확인한다. [상세 근거 및 미결 대비 충돌](../audits/2026-09-07-text-field/README.md)을 준수 기록과 함께 읽는다.

## AutoComplete

공식 행동 근거: [APG editable combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete). 시각은 [M3 Text fields](https://m3.material.io/components/text-fields/overview)와 [M3 Menus](https://m3.material.io/components/menus/overview)를 조합한다. 별도 Stable Material Web AutoComplete나 전용 Figma variant set을 검증했다고 주장하지 않는다.

- 공개 진입점은 `import { AutoComplete } from '@/ui'`다. TextField의 type/variant가 아니며 독립된 컴포넌트다. `Select`는 정해진 값 선택, `AutoComplete`는 자유 텍스트 + 선택적 제안, `TextField`는 제안 없는 native 입력이다.
- `options: readonly { label: string; disabled?: boolean }[]`, `value/defaultValue: string`, `onValueChange(value)`를 제공한다. label은 목록 내 고유해야 하며 입력·제출 문자열이다. ID 선택이 필요한 도메인은 Select를 사용한다.
- `size='large'|'small'`, prefix/suffix, error/errorText, disabled/readOnly/required, clearable, placeholder/supportingText, emptyText, name/id/form, className/style을 제공한다.
- 필터링은 Base UI locale-aware 기본 동작을 사용한다. 방향키는 input 포커스를 유지한 채 aria-activedescendant를 변경하고 Enter/클릭은 제안을 적용한다. Escape는 입력을 삭제하지 않고 닫는다. IME와 일반 편집 키 처리는 Base UI/native 입력에 맡긴다. Enter로 제안을 고르는 동작은 폼을 제출하지 않는다.
- 제안의 pointer highlight와 가상 키보드 포커스를 구분한다. Base UI `onItemHighlighted`의 `reason='keyboard'`일 때만 정적인 중성 inward ring을 표시하며, pointer 이동·목록 닫힘은 가상 포커스 표시를 제거한다. 입력 DOM focus와 aria-activedescendant 계약은 바꾸지 않는다.
- 목록에 없는 문자열도 제출할 수 있다. required는 비어 있지 않은 텍스트를 요구하며 제안 일치를 강제하지 않는다. readonly는 제출에 포함, disabled는 제외한다. controlled reset은 소비자가 onReset에서 value를 복원하며 uncontrolled는 defaultValue로 복원한다.
- 지우기는 input 포커스를 복원한다. disabled/readonly는 편집·지우기·메뉴 열기를 차단한다. 빈 결과 문구와 비활성 제안을 실제 dropdown에 표시한다.
- AutoComplete popup은 하향 zero offset이며, 상향일 때만 측정한 floating label 높이의 절반을 띄워 라벨을 덮지 않는다. 필터링·상향 전환에도 실제 dropdown과 label bounds로 검증한다.
- TextField와는 내부 `FieldOutline/OutlinedField.module.css` 시각만, Select와는 `FieldOutline/FieldDropdown.module.css` 및 메뉴 모션만 공유한다. 한 공개 컴포넌트로 다른 입력을 흉내 내지 않는다. 공유 appearance는 기존 `--md-text-field-*`/`--md-menu-*`/`--md-select-option-*` 토큰, 빈 결과는 `--md-autocomplete-empty-*` 토큰을 사용한다.
- `/components#form-fields`에 TextField, Select, AutoComplete를 각각 구분하고 속성 토글·실제 폼·제출 readback을 제공한다. TextField/AutoComplete의 Large/Small·Prefix/Suffix·Error/Disabled/Required/ReadOnly/Clearable을 직접 바꿀 수 있다. Select는 기존 56px MD3 geometry와 독립 옵션 메뉴를 유지한다.
- TextField/AutoComplete 속성 테스트는 샘플 값으로 시작해 Prefix/Suffix를 켜자마자 표시한다. `샘플 값 넣기`/`빈 값으로 테스트`로 값 있는 상태와 빈 상태를 명시적으로 비교한다. 토글은 입력값을 덮어쓰거나 포커스를 빼앗지 않는다. 빈 값·비포커스에서 affix가 숨겨지는 실제 컴포넌트 계약은 유지하고 안내문으로 설명한다. 회귀 검사는 typing 이전 실제 content opacity와 affix geometry까지 확인한다.

## Checkbox

공식 근거: [M3 Checkbox](https://m3.material.io/components/checkbox/overview), [Material Web Checkbox](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md), [Checkbox token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-checkbox.scss)

프로젝트 시각 권위는 Figma `checkbox` component set `10466:23091`이다. 실행 property의 `size(large/medium/small) × type(selected/indeterminate/unselected/error-selected/error-indeterminate/error-unselected) × state(enabled/hovered/focused/pressed/disabled)` 90개 조합을 구현한다. 공개 API는 이 조합을 `size + checked + indeterminate + error + disabled`로 정규화하며, hover/focus/pressed는 props가 아니라 실제 사용자 상호작용으로만 발생시킨다.

```ts
type CheckboxSize = 'large' | 'medium' | 'small';

interface CheckboxProps {
  className?: string;
  style?: React.CSSProperties;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  size?: CheckboxSize;
  required?: boolean;
  name?: string;
  value?: string;
  label: React.ReactNode;
  supportingText?: string;
  onCheckedChange?: (checked: boolean) => void;
}
```

- 가시 label을 기본 계약으로 한다.
- `size` 기본값은 `large`다. visual container는 large/medium/small 순서로 16/16/12px, icon canvas는 24/22/16.5px, outline은 2/2/1.5px, state layer는 36/32/24px다. shape는 2/2/1.5px다.
- `selected`, `indeterminate`, `unselected`는 각각 `checked`, `indeterminate`, 기본 상태로 표현한다. error 계열은 같은 selection semantics에 `error`를 결합한다.
- `error`는 접근 가능한 checkbox control의 `aria-invalid=true`로 노출한다. `errorText`가 있으면 일반 `supportingText`보다 우선하고 `aria-describedby`로 연결한다.
- indeterminate는 `aria-checked=mixed` 시각·접근성 상태와 native form 제출 의미를 구분한다. space로 토글하고 focus-visible을 유지한다.
- checkmark와 container의 selected/unselected token을 분리한다.
- disabled는 Figma처럼 error보다 우선하는 on-surface 계열 38% 표현을 사용하며 state layer와 ripple을 생성하지 않는다.
- Figma의 작은 visual geometry와 별도로 wrapper touch target은 48px를 유지한다. label은 body-large, supporting/error text는 body-medium component token을 사용한다.
- hover는 black 6%, focus와 pressed base layer는 black 12%를 사용한다. pressed에는 공통 Ripple을 추가하고 모든 크기에서 StateLayer/Ripple/FocusRing을 실제 상태로 렌더링한다.
- Stable Material Web의 현재 Checkbox 공개 API에는 error가 없다. 따라서 세 크기와 error presentation은 Figma에 의해 승인된 프로젝트 확장이며, native checkbox/form/keyboard/indeterminate 동작을 바꾸지 않는다. 이 차이는 manifest `deviations`에 기록하고 M3 기본 API로 오인하지 않는다.
- component instance의 `className`/`style`은 label visual root에 적용되므로 `--md-checkbox-*` component token만 재정의해 theme-safe하게 커스터마이즈한다.

## Radio

공식 근거: [M3 Radio button](https://m3.material.io/components/radio-button/overview), [Material Web Radio](https://github.com/material-components/material-web/blob/main/docs/components/radio.md), [Radio token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-radio.scss), [고정 Radio token snapshot](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/v0_192/_md-comp-radio-button.scss)

프로젝트 시각 권위는 Figma `radios` guide `10724:12073`와 executable component set `10466:24840`이다. 실행 property의 `size(large/medium/small) × selected(true/false) × state(enabled/hovered/focused/pressed/disabled)` 30개 조합을 구현한다. 선택 여부는 개별 시각 prop으로 흉내내지 않고 이름이 있는 `RadioGroup`의 단일 값으로 관리하며, hover/focus/pressed는 실제 상호작용으로만 발생시킨다.

```ts
type RadioSize = 'large' | 'medium' | 'small';
type RadioGroupOrientation = 'horizontal' | 'vertical';

interface RadioProps {
  value: string;
  label: React.ReactNode;
  size?: RadioSize;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  supportingText?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface RadioGroupProps<Value extends string = string> {
  name: string;
  label: React.ReactNode;
  children: React.ReactNode;
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  orientation?: RadioGroupOrientation;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  form?: string;
  supportingText?: string;
}
```

- `Radio`는 항상 접근 가능한 이름을 제공하는 가시 label을 갖고, `RadioGroup`도 별도의 가시 group label을 필수로 한다. group은 `role=radiogroup`/`aria-labelledby`, 각 항목은 `role=radio`/`aria-checked`를 제공하며 hidden native radio input이 `name`, `value`, `required`, `form` 제출을 담당한다.
- 같은 group에서 한 값만 선택한다. Tab은 선택 항목 또는 첫 활성 항목 하나에 진입하고, ArrowLeft/Right/Up/Down은 활성 항목 사이를 이동하면서 값을 변경한다. Space는 현재 항목을 선택하고 Enter는 선택 동작으로 사용하지 않는다. disabled 항목은 focus·선택·ripple 대상에서 제외한다.
- 공개 `size`는 executable property의 `large/medium/small`을 따른다. guide caption의 `large/small/x-small`은 실행 property와 불일치하므로 API 이름으로 사용하지 않는다.
- large/medium/small의 icon canvas는 24/20/16px, state layer는 36/32/24px, padding은 6/6/4px다. 시각 밀도와 별도로 모든 크기의 실제 touch target은 48px, focus ring은 Stable Material Web의 44px를 유지한다.
- selected icon은 `primary`, unselected icon은 `on-surface-variant`다. Figma export처럼 interaction 중 icon color는 변하지 않는다. disabled selected/unselected는 `on-surface-variant` 38%다.
- hover는 black 6%, focus와 pressed는 black 12% state layer를 사용한다. 이는 Stable Material Web의 semantic foreground state-layer 색상, 40px state layer, disabled `on-surface` 38%와 다른 Figma 승인 override이며 manifest `deviations`에 기록한다.
- 선택 inner circle은 Stable Material Web의 300ms emphasized-decelerate scale 진입과 양방향 50ms opacity를 사용한다. 해제 시 scale 축소는 없다. 공식 소스처럼 reduced-motion에서도 유지하며 disabled에서만 animation/transition을 중지한다.
- Figma export의 24px SVG geometry를 `currentColor` 기반 내부 아이콘으로 변환해 세 크기에서 동일 비율로 축소한다. 원격 7일 asset URL은 runtime 의존성으로 남기지 않는다.
- component instance의 `className`/`style`은 공개 row root에 적용되므로 `--md-radio-*` component token만 재정의해 theme-safe하게 커스터마이즈한다.

## Tabs

공식 근거: [M3 Tabs](https://m3.material.io/components/tabs/overview), [Material Web Tabs](https://github.com/material-components/material-web/blob/main/docs/components/tabs.md), [Primary Tab token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-primary-tab.scss), [Material Web Tabs behavior](https://github.com/material-components/material-web/blob/main/tabs/internal/tabs.ts)

프로젝트 시각 권위는 Figma `tab & tabs` guide/executable section `10724:12784`다. 실행 Tab은 40px container, 16px 수평·10px 수직 padding, 2px label/icon gap, `label/large-prominent`, optional 20px trailing close glyph, 3px full-width selected indicator와 `surface-container-lowest` 배경을 사용한다. guide caption의 `focused/pressed`와 executable property의 `selected/selected_hovered`가 일치하지 않으므로 selection은 `Tabs` value로, hover/focus/pressed는 실제 입력 상태로만 만든다.

```ts
interface TabsProps<Value extends string = string> {
  children: React.ReactNode;
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value, details: TabsValueChangeDetails) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TabsValueChangeDetails {
  reason: 'none' | 'disabled' | 'missing' | 'initial';
  activationDirection: 'left' | 'right' | 'up' | 'down' | 'none';
  cancel(): void;
  readonly isCanceled: boolean;
}

interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  autoActivate?: boolean;
  loopFocus?: boolean;
}

interface TabProps<Value extends string = string>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  value: Value;
  children: React.ReactNode;
  showTrailingIcon?: boolean;
  trailingIcon?: React.ReactNode;
}

interface TabPanelProps<Value extends string = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'hidden'> {
  value: Value;
  children: React.ReactNode;
  keepMounted?: boolean;
}
```

- `TabList.label`은 필수 접근명으로 `role=tablist`에 적용한다. 각 `Tab`은 `role=tab`, `aria-selected`, roving `tabIndex`, `aria-controls`를 가지며 같은 value의 `TabPanel`은 `role=tabpanel`과 `aria-labelledby`로 자동 연결된다.
- Stable Material Web과 같이 manual activation이 기본이다. ArrowLeft/Right는 RTL을 고려해 focus를 순환하고 Home/End는 양 끝 Tab으로 이동한다. 이때 선택은 바꾸지 않으며 Enter/Space 또는 click으로 선택한다. `autoActivate`를 명시하면 방향키 focus와 선택이 함께 이동한다. `onValueChange`의 project-owned details는 `reason`, `activationDirection`, `cancel()`을 제공해 user interaction selection을 취소할 수 있다.
- Figma disabled Tab은 `aria-disabled=true`로 노출하고 composite 방향키 탐색에서는 발견 가능하지만 Enter/Space/click 선택과 ripple은 만들지 않는다. focus가 tab list 밖으로 나가면 roving 진입점은 선택 Tab으로 복원된다. 선택 변경은 250ms emphasized FLIP으로 full-width 3px indicator를 이전 rect에서 새 rect로 옮긴다. reduced-motion은 교차 fade, resize는 즉시 재측정하며 가로 overflow에서는 tab list 자체가 scrollable이다.
- Figma trailing `close` glyph는 기본 표시되는 장식 content이며 accessible name에 포함하지 않는다. Stable Material Web에 trailing close action 계약이 없고 `role=tab` 내부의 nested button도 허용하지 않으므로 이 API에서 삭제 동작으로 가장하지 않는다. 실제 closable workspace tab은 별도 keyboard/delete/focus 계약 승인 후 확장한다.
- 공통 StateLayer/Ripple/inward FocusRing을 사용한다. hover/focus/pressed는 Figma system layer 6%/12%/16%, disabled label은 `on-surface-variant-bright`, indicator는 `primary`다. Windows forced-colors에서는 divider/label/selected indicator/focus/disabled 구분을 system color로 유지한다.
- Figma의 40px 밀도, prominent 600 label, full-width indicator와 trailing glyph는 Stable Material Web 기본 Primary Tab anatomy와의 차이로 manifest `deviations`에 기록한다.

## Switch

공식 근거: [M3 Switch](https://m3.material.io/components/switch/overview), [Material Web Switch](https://github.com/material-components/material-web/blob/main/docs/components/switch.md), [Material Web Switch behavior](https://github.com/material-components/material-web/blob/main/switch/internal/switch.ts), [Stable v0.192 Switch token](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-switch.scss)

프로젝트 시각 권위는 Figma `switch` section `10724:13609`와 executable component set `10467:34474`다. 원본 30개 조합 중 제품 범위는 small만 채택하므로 공개 size 축을 제거하고 `selected(true/false) × state(enabled/hovered/focused/pressed/disabled) × Icon=true` 10개 조합을 구현한다. 선택은 `selected/defaultSelected/onSelectedChange`로 관리하고 hover/focus/pressed는 실제 pointer·keyboard 입력으로만 발생시킨다.

```ts
interface SwitchChangeDetails {
  reason: 'none';
  cancel(): void;
  readonly isCanceled: boolean;
}

interface SwitchProps {
  'aria-label': string;
  'aria-describedby'?: string;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean, details: SwitchChangeDetails) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  uncheckedValue?: string;
  form?: string;
  id?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  style?: React.CSSProperties;
}
```

- 단독 Switch는 가시 label이 없으므로 explicit `aria-label`을 필수로 한다. root는 `role=switch`, `aria-checked`를 제공하고 hidden native checkbox가 `name`, `value`, `uncheckedValue`, `required`, `form`, disabled와 form submission을 담당한다.
- click과 native Space에 더해 Stable Material Web Switch가 정의한 Enter로도 선택 상태를 전환한다. disabled/readOnly에서는 선택 변경과 ripple을 만들지 않는다. `onSelectedChange`의 project-owned details는 `cancel()`로 사용자 변경을 취소할 수 있다.
- 고정 small geometry는 track 32×18px, handle 12px, icon 12px, state layer 24px, outline 1px다. pressed에서도 handle 크기는 증가하지 않는다. 작은 visual과 별도로 실제 control은 최소 48px touch target을 유지한다.
- selected track은 `primary`, enabled handle은 `on-primary`, interaction handle은 `primary-container`다. unselected track은 `surface-container-highest`와 `outline-high`, enabled handle은 `outline-high`, interaction handle은 `on-surface-variant`다. hover는 black 6%, focus/pressed는 black 12% state layer를 사용한다.
- 채택한 small variant는 `Icon=true`이므로 check/close glyph를 모든 상태에 표시한다. Material Web의 no-icon/selected-only icon 축은 공개 API로 추정하지 않는다. glyph는 self-hosted `MaterialIcon` adapter를 사용하며 accessible name에는 포함하지 않는다.
- 공통 StateLayer, pointer·keyboard Ripple, FocusRing을 사용한다. handle은 숫자 위치 사이를 300ms Stable overshoot로 이동하며 size 250ms/pressed 100ms, color 67ms, 두 icon의 fade 33ms를 사용한다. reduced-motion에서도 공식 Switch 전환은 유지한다. Windows forced-colors에서는 visual opacity를 해제하고 system color로 track, handle, selected, disabled와 focus를 구분한다.
- large/medium은 공개 API, component token, CSS selector, Story와 검증 matrix에서 모두 제거한다. Figma small의 32×18px 고밀도 anatomy는 Stable Material Web의 52×32px 기본 anatomy와 다른 프로젝트 승인 deviation이며 manifest에 기록한다.
- Switch는 자동화로 name/role/state, Space/Enter, form projection과 focus를 검증할 수 있는 단순 binary control이므로 별도 blanket screen-reader blocker를 추가하지 않는다. 실제 announcement가 필요한 설명·복합 focus·live-region 흐름만 대표 AT 검증 대상으로 유지한다.

## Segmented Button

공식 근거: [M3 Segmented buttons](https://m3.material.io/components/segmented-buttons/overview), [Material Web Labs segment source](https://github.com/material-components/material-web/blob/main/labs/segmentedbutton/internal/segmented-button.ts), [Material Web Labs set source](https://github.com/material-components/material-web/blob/main/labs/segmentedbuttonset/internal/segmented-button-set.ts)

프로젝트 시각 권위는 Figma `segmentedButton` section `10724:13951`이다. start/middle/end building block은 각각 27개, 합계 81개 variant이며 `Segments=5, Density=-2` composition을 별도로 제공한다. Stable Material Web 공개 문서와 runtime component는 없으므로 Labs 코드를 import하지 않는다. 행동 계약을 교차 검증하며, 2026-09-07 사용자의 후속 요청으로 선택 모션을 프로젝트 확장으로 적용했다. 이는 Labs를 Stable 권위로 승격하는 결정이 아니다.

```ts
type SegmentedButtonSelectionMode = 'single' | 'multiple';

type SegmentedButtonSetProps<Value extends string> =
  | {
      label: string;
      selectionMode?: 'single';
      value?: Value;
      defaultValue?: Value;
      onValueChange?: (value: Value, details: SegmentedButtonChangeDetails<Value>) => void;
    }
  | {
      label: string;
      selectionMode: 'multiple';
      value?: readonly Value[];
      defaultValue?: readonly Value[];
      onValueChange?: (value: Value[], details: SegmentedButtonChangeDetails<Value>) => void;
    };

interface SegmentedButtonProps<Value extends string>
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  value: Value;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  selectedIcon?: React.ReactNode;
  hideSelectedIcon?: boolean;
}
```

- `SegmentedButtonSet.label`은 `role=group`의 필수 접근명이다. 각 `SegmentedButton`은 native `button`과 `aria-pressed`를 사용한다. 일반 button group처럼 모든 enabled segment가 Tab 순서에 남고 Space/Enter/click으로 활성화한다.
- `single`은 선택된 segment를 다시 눌러 해제하지 않는다. `multiple`에서만 항목별 toggle을 허용한다. disabled는 callback, state layer, ripple을 만들지 않는다.
- selected labeled segment는 configured icon을 check로 교체한다. selected icon-only segment는 Figma executable node처럼 check와 configured icon을 모두 유지한다. `hideSelectedIcon`은 Material Web `no-checkmark`에 대응한다.
- 선택 모션은 사용자가 명시적으로 요청한 Labs `nextAnimationState` 및 keyframe 이식을 따른다. graphic은 18px icon + 8px gap을 포함해 0↔26px/150ms standard로 전환한다. 기본 SVG check는 50ms 지연 후 150ms 동안 dashoffset 29.7833385→0으로 그린다. 해제 check 50ms fade-out, 기존 labeled icon은 선택 75ms fade-out / 해제 50ms delay+150ms fade-in이다. 초기 mount는 정적이며 재선택은 원본처럼 draw keyframe을 재시작한다. font clip reveal과 음수 margin 보정은 폐기했다. custom selectedIcon fade, hideSelectedIcon의 기존 icon 유지, disabled/reduced-motion 정지는 명시적 프로젝트 예외다. [Labs 교정 감사](../audits/2026-09-07-segmented-button-labs/README.md)와 `/components#navigation`을 따른다.
- geometry는 32px container, 12px inline padding, 8px gap, 18px icon, 48px outer radius, 1px outline, 48px minimum touch target이다. `label-large` 6개 typography 속성을 component token으로 함께 소비한다.
- selected는 `custom-container/on-secondary-container`, unselected는 transparent/`on-surface`/`outline-high`, disabled outline은 `outline-middle`, disabled content는 `on-surface` 38%다. hover/focus/pressed는 Figma black 6%/12%/16% layer다.
- Figma에 disabled-selected variant가 없지만 controlled application state가 disabled value를 가리킬 수 있으므로 selected 상태와 check를 숨기지 않는다. 이 차이는 manifest deviation으로 기록한다.
- Windows forced-colors에서는 Canvas/ButtonText, Highlight/HighlightText, GrayText로 상태를 분리한다. 실제 OS 치환과 screen reader의 group/pressed announcement는 수동 게이트다.

## Chip

공식 근거: [M3 Chips](https://m3.material.io/components/chips/overview), [Material Web Chips](https://github.com/material-components/material-web/blob/main/docs/components/chip.md), [Filter Chip source](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/chips/internal/filter-chip.ts), [Input Chip source](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/chips/internal/input-chip.ts)

프로젝트 시각 권위는 Figma `chip/assistive` `10463:4107`, `chip/filter` `10560:12598`, `chip/input` `10560:12744`, `chip/location` `10563:12834`다. M3의 Assist/Filter/Input 의미론과 Chip Set toolbar 동작을 유지하되, 타입명·크기·색상·shape·spacing·typography는 이 네 component set의 실행 property와 local variable binding을 사용한다.

```ts
type ChipType = 'assistive' | 'filter' | 'input' | 'location';
type ChipSize = 'large' | 'small' | 'x-small';
type ChipAssistiveLevel =
  | 'primary' | 'secondary' | 'neutral' | 'outline'
  | 'systemError' | 'systemWarning' | 'systemGood' | 'systemInfo'
  | 'systemErrorVariant' | 'systemWarningVariant'
  | 'systemGoodVariant' | 'systemInfoVariant';

type ChipProps =
  | AssistiveChipProps
  | FilterChipProps
  | InputChipProps
  | LocationChipProps;

interface ChipSetProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}
```

- `chipType` 기본값은 `assistive`, `size` 기본값은 `large`다. Figma의 `neutural` variant 오탈자는 공개 API에서 `neutral`로 정규화하되 같은 `surface-container/on-surface` binding을 사용한다.
- Assistive는 `level × size`를 구현한다. `primary`, `secondary`, `neutral`, `outline`, 네 system solid와 네 system container variant는 모두 해당 Figma color variable의 system alias를 component token에서 참조한다.
- Filter는 `selected`, `defaultSelected`, `onSelectedChange`의 controlled/uncontrolled 양쪽 계약을 제공하며 실제 button의 `aria-pressed`와 동기화한다. 선택 시 leading `check`, 기본 `showTrailingIcon=true`일 때 trailing `arrow_drop_down`을 Material Icon adapter로 렌더링한다. consumer의 `onClick`이 기본 동작을 취소하면 선택 값도 변경하지 않는다.
- Filter의 비선택 label은 Figma 내부 label wrapper inset을 보존한다. large/small/x-small의 outer start padding은 8/6/10px이고 label inset은 4/2/2px다. 선택 상태는 같은 outer padding 뒤 check와 4/2/2px content gap을 사용한다.
- Input은 기본적으로 label 주 동작과 `close` 삭제 동작을 형제 button으로 렌더링한다. `removeOnly`에서는 label을 비대화형 content로 바꾸고 제거 button만 toolbar action이 된다. 삭제 action에는 `removeLabel` 또는 문자열 label에서 파생된 접근 가능한 이름을 제공하며, `onRemove`가 기본 동작을 취소하지 않으면 컴포넌트가 실제로 제거된다. Figma의 `selected`는 시각 상태이며 Filter처럼 자동 토글하지 않는다.
- Location은 프로젝트 전용 Figma 표시 타입이다. 원본 component set처럼 selected/action 상태를 만들지 않고 button·state layer·ripple·roving focus가 없는 비대화형 정보로 렌더링한다. `small` 24px container에 `prefix`의 `label-medium-prominent`와 거리 값의 `label-medium`을 배치한다. 기본 prefix는 `X`, gap은 6px, shape는 4px, outline은 `outline-low`다. 이는 표준 M3 Suggestion Chip을 가장한 구현이 아니라 manifest에 기록된 명시적 프로젝트 deviation이다.
- Figma container 높이는 large/small/x-small 순서로 32/24/20px, icon은 20/16/16px, shape는 Assistive/Filter/Input 8px와 Location 4px다. 대화형 action은 시각 container와 별도로 세로 touch target 48px를 유지하며 비대화형 Location에는 가상의 touch target을 만들지 않는다.
- spacing은 `component token → space/gap system token`으로 연결한다. Assistive는 large 12px·compact 8px 수평 padding, Filter는 위의 outer padding과 label inset 조합, Input은 large 16px start·4px icon gap·8px end와 compact 10/2/6px, Location은 10px start·6px gap·6px end를 사용한다. 축약 CSS 선언에서 미정의 trailing 변수가 start padding까지 무효화하지 않도록 inline start/end를 독립 속성으로 적용한다.
- `ChipSet`은 접근 가능한 `toolbar`이며 label을 필수로 한다. Tab은 현재 roving action 하나에 진입하고 Left/Right/Home/End가 primary와 remove action 사이를 이동한다. RTL에서는 Left/Right 방향을 반전한다. 비대화형 Location은 toolbar 밖에 인접 표시한다.
- 모든 action은 공통 StateLayer/Ripple/FocusRing을 사용한다. disabled action은 ripple과 state layer를 만들지 않고, forced-colors에서는 visible outline·selected Highlight·disabled GrayText를 유지한다.
- component instance의 `className`/`style`은 시각 root에 적용되므로 `--md-*-chip-*`만 재정의해 theme-safe하게 커스터마이즈한다.

## Select

공식 근거: [Material Web Select](https://github.com/material-components/material-web/blob/main/docs/components/select.md), [Outlined Select token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-outlined-select.scss)

```ts
interface SelectOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps<T extends string> {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'filled' | 'outlined';
  label: string;
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (value: T) => void;
}
```

- trigger는 TextField와 같은 visual family를 사용하되 select semantics를 유지한다.
- popup의 highlighted/focus 상태와 form selection을 분리한다. 현재 form value를 별도 selected container나 check icon으로 장식하지 않고, 열릴 때 현재 option으로 focus를 이동한다. 포커스 이동 자체는 ring 표시 조건이 아니다. Material Web처럼 `:focus-visible`을 구분하여 pointer로 열거나 hover할 때는 ring을 강제하지 않는다.
- arrow key, Home/End, typeahead, Enter/Space, Escape 동작을 실제 흐름에서 검증한다.
- required와 form value를 Base UI form contract와 함께 검증한다.
- popup은 viewport collision을 처리하고 Theme token을 상속한다.
- Material Web Select처럼 field의 `end-start` corner와 menu의 `start-start` corner를 offset 없이 연결한다. Base UI에서는 `alignItemWithTrigger={false}`, `align="start"`, `sideOffset={0}`의 bottom placement로 번역하며 선택 option을 field 위에 겹치는 기본 경로를 사용하지 않는다.
- Select option은 일반 Menu item의 48px가 아니라 Stable Material Web의 one-line Select option처럼 56px container를 사용한다. label typography와 horizontal 16px spacing은 Select 전용 component token을 통해 소비한다.
- outlined 값 영역은 floating label과 독립적으로 56px container의 수직 중앙을 유지하고 focus outline은 3px를 사용한다.
- outlined label은 TextField와 같은 16px 시작 공간과 글자 양쪽 4px notch 공간을 사용하고, trailing dropdown icon은 24px component token을 사용한다.
- Stable Material Web의 기본 `quick=false` 계약을 따른다. popup 열림은 500ms emphasized 높이 전개, surface 50ms fade, 각 option 250ms fade를 전체 500ms 안에서 순차 적용하고, 닫힘은 150ms emphasized-accelerate 전환을 사용한다.
- Material Web의 position-before-animation 순서를 보존한다. Base UI Portal mount가 아니라 Positioner의 실제 side·opacity와 두 frame 연속 stable rect를 readiness로 사용하고, 전체 content의 `scrollHeight`가 아닌 viewport에 clamp된 surface의 `offsetHeight`를 측정한다.
- position shell과 visual surface를 분리한다. Base UI Popup shell은 최종 full height를 animation 동안 유지해 collision 계산값을 불변으로 만들고, nested `menu-surface`만 `0 → full` height와 opacity를 전환한다. 그렇지 않으면 작은 중간 높이에서 `bottom`, 큰 높이에서 `top`으로 재배치되는 점프가 발생한다.
- 위쪽으로 flip될 때 visual surface를 full-size shell의 block-end에 고정한다. Material Web의 slot correction처럼 내부 content에만 역방향 translate를 적용하며, popup shell 자체에는 height/transform animation을 적용하지 않는다.
- Base UI가 선택 option focus/`scrollIntoView`를 positioning보다 먼저 요청하더라도 adapter가 이를 열림 완료까지 보류한다. 최종 배치가 확정된 뒤 focus와 내부 scroll을 적용해 문서 스크롤이 collision 판단을 바꾸지 않게 한다.
- 운영체제 reduced-motion 설정만으로 `quick=true` 의미를 만들지 않는다. 명시적인 quick API를 제공하기 전까지 Stable Material Web 기본 메뉴 모션을 유지한다.
- 열림 완료 뒤 모든 option의 computed opacity가 `1`, 높이가 56px이고 popup 시작 좌표가 field bottom 또는 popup bottom 좌표가 field top과 일치하는지를 실제 흐름에서 검증한다. 하단 공간 부족에서는 문서 scrollY 불변, opening frame별 bottom gap 1px 이하, 단조 증가하는 surface height를 함께 확인한다. open → close → open을 반복해 닫힘 animation의 fill state가 다음 열림에 남지 않는지도 확인하며, animation 객체 존재만으로 완료를 판정하지 않는다.
- 비활성 옵션은 화면과 접근성 트리에 남지만 Material Web list navigation처럼 방향키/첫 포커스 대상에서 제외하며 선택·ripple을 만들지 않는다. Base UI 1.7의 disabled Item 탐색 기본값과 달라 비활성 항목은 interactive registry 밖의 option으로 렌더링한다.
- 빈 Select의 내부 라벨과 placeholder가 겹치지 않도록 비포커스 placeholder를 숨긴다.
- option은 공통 StateLayer/Ripple과 3px inward FocusRing을 사용한다. 키보드 탐색에서만 정적인 중성 ring을 표시하며 disabled option은 ring/ripple을 만들지 않는다. 색상·motion의 사용자 요청 예외는 아래 드롭다운 피드백 규칙을 따른다.

## Dialog

공식 근거: [M3 Dialogs](https://m3.material.io/components/dialogs/overview), [Material Web Dialog](https://github.com/material-components/material-web/blob/main/docs/components/dialog.md)

```ts
interface DialogProps {
  className?: string;
  style?: React.CSSProperties;
  open?: boolean;
  defaultOpen?: boolean;
  variant?: 'basic' | 'alert';
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onOpenChange?: (open: boolean, reason: 'trigger' | 'escape' | 'backdrop' | 'action') => void;
}

type DialogCloseProps = ButtonProps;
```

- modal backdrop, focus trap, initial focus, final focus 복원을 검증한다.
- alert variant는 명시적 선택이 필요한 경우에만 사용한다.
- 제목과 설명을 accessible name/description에 연결한다.
- 긴 내용은 content 영역만 scroll하고 action 영역을 잃지 않는다.
- dismiss 가능 여부는 제품 정책으로 명시하며 Base UI 기본값에 암묵적으로 맡기지 않는다.
- 앱은 Base UI namespace를 직접 소비하지 않고 `DialogClose` adapter로 action dismissal을 구성한다.

## Menu

공식 근거: [M3 Menus](https://m3.material.io/components/menus/overview), [Material Web Menus](https://github.com/material-components/material-web/blob/main/docs/components/menu.md)

```ts
type MenuItem =
  | { type: 'item'; id: string; label: React.ReactNode; leadingIcon?: React.ReactNode; disabled?: boolean; onSelect(): void }
  | { type: 'checkbox'; id: string; label: React.ReactNode; leadingIcon?: React.ReactNode; checked: boolean; disabled?: boolean; onCheckedChange(value: boolean): void }
  | { type: 'radio'; id: string; label: React.ReactNode; leadingIcon?: React.ReactNode; value: string; disabled?: boolean }
  | { type: 'submenu'; id: string; label: React.ReactNode; leadingIcon?: React.ReactNode; items: MenuItem[]; disabled?: boolean };

interface MenuProps {
  className?: string;
  style?: React.CSSProperties;
  items: MenuItem[];
  label: string;
}
```

- highlighted, selected/checked, disabled를 다른 상태로 표현한다.
- keyboard navigation, typeahead, Escape, submenu 방향키를 검증한다.
- popup/document/fixed positioning 중 Base UI positioner를 기본으로 사용하고 custom 좌표는 명시적 adapter로 제한한다.
- item 선택 후 focus가 trigger로 돌아오는지 검증한다.
- submenu의 pointer grace behavior를 시각 효과가 깨뜨리지 않아야 한다.
- list item의 leading/trailing icon은 Stable Material Web list token과 같은 24px를 사용한다. 선택 check와 submenu chevron 모두 같은 component token을 소비한다.
- Select와 같은 Stable Material Web 메뉴 모션을 공유한다. 열림 500ms·surface 50ms·item 250ms stagger, 닫힘 150ms이며, reduced-motion 설정만으로 이를 제거하지 않는다.
- 공용 motion adapter는 Popup shell과 Positioner를 함께 관찰한다. 최종 side/rect가 안정되기 전에 애니메이션을 시작하지 않고, full-size shell 안의 visual surface만 전환해 전체 animation 동안 side를 고정한다.
- Menu/Submenu의 item focus·scroll도 Select처럼 열림 완료까지 보류한다. 내부 surface의 WAAPI animation은 Base UI의 Popup 자체 animation 감지와 별개이므로, 닫힘 요청에 `preventUnmountOnClose()`를 적용하고 150ms surface 종료 callback에서 `actionsRef.unmount()`로 실제 portal을 제거한다. 위치 확정 전 취소는 즉시 완료하고, 재열림은 이전 종료 callback을 취소한다. 같은 controlled open이 primitive와 motion을 구동한다.
- item은 공식 `--md-menu-item-*`와 `--md-list-item-*` component token을 소비하고 공통 StateLayer/Ripple/inward FocusRing을 사용한다.

### 드롭다운 피드백 규칙 (Menu / Select / AutoComplete)

- Figma `listItem 10742:16969`의 실제 hovered/selected 4개 variant는 동일한 `state-layer/hovered` black 6%를 사용한다. `drawMenu 10742:17727`의 바탕은 `surface-container-lowest`다. Light/Standard는 이를 component token으로 연결하고, Dark/High는 `on-surface` 8% hover/selected·10% focus/pressed로 중성색 식별을 유지한다. Dark/High는 이 노드에서 검증된 별도 Figma variant가 아니라 프로젝트 대응이다.
- 체크된 Menu의 선택 배경과 hover 레이어를 이중 합성하지 않는다. label은 on-surface, check/leading icon은 on-surface-variant로 두어 secondary 강조색을 만들지 않는다. Select의 form selection과 AutoComplete의 제안 highlight에는 Menu checked 배경을 재사용하지 않는다.
- Material Web의 `:focus-visible` 판별은 유지한다. 사용자 요청에 따라 드롭다운 내부 ring만 secondary 색상·0→8→3px 펄스를 제거하고 **정적인 on-surface 3px inward ring**으로 제한한다. Figma에는 focused variant나 이 ring의 motion 정의가 없으므로 Material Web 기본값과 완전히 동일하다고 주장하지 않는 명시적 시각 예외다. 다른 컴포넌트의 표준 ring 모션은 유지한다.
- Firefox의 composite programmatic focus는 방향키 입력 뒤에도 `:focus-visible`이 false일 수 있다. Menu/Select는 trigger와 portal popup의 실제 keydown/pointer capture로 입력 방식을 보완하며, keyboard 상태에서 현재 DOM focus 항목만 ring을 표시한다. pointer 이동/누름은 이를 해제한다. 이벤트 기본 동작·Base UI navigation을 가로채지 않고, hover나 programmatic focus만으로 키보드 상태를 만들지 않는다. AutoComplete는 Base UI의 virtual focus reason을 사용한다.
- 키보드로 연 서브메뉴는 정지한 pointer 아래 메뉴가 움직이며 발생한 `trigger-hover/mouseleave`만으로 닫히지 않는다. keyboard mode에서는 이 hover dismiss 요청만 취소한다. 실제 trigger/popup pointer 조작 후에는 원래 hover grace를 사용하며 Escape·왼쪽 방향키·외부 클릭 닫힘은 그대로다.
- Light/Standard focus/pressed는 기존 Figma system state-layer 12%/16%를 사용한다. 이 색상은 이미 alpha가 포함되어 있어 StateLayer/Ripple opacity를 다시 곱하지 않는다. Ripple은 pressed 색상을 고정 참조하여 release 뒤 hover 색상으로 바뀌지 않게 한다.
- hover 상태 레이어의 기존 15ms 전환, 메뉴 열림/닫힘, 키보드 탐색·선택·복귀는 유지한다. Figma listItem의 36px/body-small 및 callout 모양은 별도 anatomy 범위로, 이번 피드백 교정에서 기존 Menu 48px·Select 56px를 바꾸지 않는다.
- 실제 진입점과 원본 노드·회귀·제약은 [드롭다운 피드백 감사](../audits/2026-09-07-dropdown-feedback/README.md)에 기록한다. 기존 접근성 수동 검증 BLOCKED를 해제하지 않는다.

## Snackbar

공식 근거: [M3 Snackbar](https://m3.material.io/components/snackbar/overview). Material Web 대응 문서는 `unavailable`이다. 구현 primitive는 Base UI Toast를 사용한다.

```ts
interface SnackbarOptions {
  id?: string;
  message: React.ReactNode;
  action?: { label: string; onAction(): void };
  dismissLabel?: string;
  timeout?: number;
  type?: 'message' | 'loading' | 'success' | 'error';
}

interface SnackbarManager {
  show(options: SnackbarOptions): string;
  update(id: string, options: Partial<SnackbarOptions>): void;
  dismiss(id: string): void;
}
```

- `type`은 manager 상태와 announcement 정책에 사용하며 임의 status color variant를 만들지 않는다.
- loading은 `timeout: 0`으로 유지하고 같은 id를 success/error로 update할 수 있다.
- action은 최대 하나이며 message를 가리지 않는다.
- 자동 dismiss 중 hover/focus와 페이지 비활성 상태를 고려한다.
- action 실행과 dismiss를 중복 호출하지 않는다.
- Base UI Toast의 F6 navigation과 live region 동작을 실제 키보드·스크린리더 흐름으로 검증한다.
- description의 실제 line box를 측정해 한 줄은 48px, 두 줄은 `--md-snackbar-two-lines-container-height` 68px minimum을 적용한다.

## 컴포넌트 검증 페이지

실제 Vite 앱의 `/components`를 공개 컴포넌트 검증 진입점으로 사용한다. 이 페이지는 Storybook이나 테스트 fixture를 대신하는 것이 아니라, 애플리케이션이 `src/ui/index.ts`를 통해 소비하는 동일한 구현을 사람이 직접 비교하고 조작하는 표면이다.

- 컴포넌트별 공개 variant, size, 주요 상태와 disabled 상태를 한 화면에서 비교한다.
- 선택, 제거·복원, dialog focus 복귀, menu 조작, snackbar 표시처럼 상태 변화가 있는 동작은 실제로 실행 가능해야 한다.
- 새 컴포넌트 세로 슬라이스는 `/components` inventory, 대표 상호작용 E2E, 해당 컴포넌트 문서와 compliance 기록을 같은 변경에서 추가한다.
- 페이지 자체는 별도 UI 구현을 복제하지 않고 반드시 `src/ui/index.ts` 공개 API만 소비한다.
