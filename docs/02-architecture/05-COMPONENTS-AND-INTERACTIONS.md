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
- 동시에 여러 pointer가 들어오면 ripple id별로 관리한다.
- 애니메이션 종료 후 DOM node를 제거한다.
- reduced motion에서도 Material Web의 입력 피드백과 동일하게 ripple을 제거하지 않는다.
- ripple element는 accessibility tree와 hit testing에서 제외한다.

## FocusRing

- `:focus-visible`에서만 기본 indicator를 표시한다.
- component shape를 따르며 문서가 요구하는 inward/outward 방식을 구분한다.
- outline thickness와 offset은 token으로 관리한다.
- Windows forced colors에서 `CanvasText` 또는 system highlight가 보이도록 fallback한다.
- focus indicator는 ripple, border, active indicator와 독립적이어야 한다.

## Motion

- visibility 전환은 Base UI의 `data-starting-style`, `data-ending-style`에 CSS transition을 연결한다.
- opening과 closing 도중 방향이 바뀌어도 현재 computed state에서 부드럽게 취소·역전되어야 한다.
- opacity와 transform만으로 의미가 충분한 overlay에 layout animation을 추가하지 않는다.
- motion token 밖의 duration/easing을 사용하지 않는다.
- reduced motion에서는 transform과 ripple 확장을 제거하고 최종 상태를 즉시 적용한다.
- Expressive spring/shape morph는 `deferred`; 이를 흉내 낸 임의 easing을 만들지 않는다.

## Button

공식 근거: [M3 Buttons](https://m3.material.io/components/buttons/overview), [Material Web Buttons](https://github.com/material-components/material-web/blob/main/docs/components/button.md)

```ts
type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
```

- 기본 variant는 `filled`다.
- native button semantics와 form association을 보존한다.
- documented default size를 MVP 기준으로 사용하고 임의 size prop은 추가하지 않는다.
- icon-only action은 Button이 아니라 IconButton을 사용한다.
- disabled focus 정책은 Material Web Accessibility 문서와 Base UI 동작을 대조한다.
- loading은 M3 Button anatomy에 없는 확장이므로 MVP 공개 API에서 제외한다.
- label은 `label-large` 14px/20px/500, icon은 18px, icon-label 간격은 8px component token을 사용한다.
- 기본 좌우 공간은 24px이며 leading icon은 16px/24px, trailing icon은 24px/16px로 방향별 token을 적용한다.

## IconButton

공식 근거: [M3 Icon buttons](https://m3.material.io/components/icon-buttons/overview), [Material Web Icon Buttons](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md)

```ts
type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  selected?: boolean;
  selectedIcon?: React.ReactNode;
  icon: React.ReactNode;
  'aria-label': string;
}
```

- 가시 label이 없으므로 접근 가능한 이름을 필수로 한다.
- toggle은 `selected`와 `aria-pressed`를 동기화한다.
- selected/unselected icon이 다르면 layout shift 없이 교체한다.
- unbounded ripple은 hit target을 변경하지 않는다.
- documented default size를 사용하고 Expressive size range는 공개하지 않는다.

## TextField

공식 근거: [M3 Text fields](https://m3.material.io/components/text-fields/overview), [Material Web Text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md), [Outlined text field 구현](https://github.com/material-components/material-web/blob/main/textfield/outlined-text-field.ts)

```ts
type TextFieldVariant = 'filled' | 'outlined';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  variant?: TextFieldVariant;
  label: string;
  supportingText?: string;
  error?: boolean;
  errorText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}
```

- label과 input association을 유지한다.
- placeholder를 label 대체로 사용하지 않는다.
- error는 `aria-invalid`, error/supporting text는 `aria-describedby`에 연결한다.
- supporting/error text는 `body-small` 12px/16px/400, 상단 4px, 좌우 16px component token을 사용하며 상위 Grid stretch의 영향을 받지 않는다.
- native input type, required, min/max/pattern과 form reset을 보존한다.
- textarea는 별도 `TextArea` wrapper로 확장할 수 있지만 MVP TextField와 혼합하지 않는다.
- character counter는 maxLength와 연결된 후속 slot이며 MVP 필수는 아니다.
- outlined 값 영역은 56px container의 수직 중앙을 유지하고, leading icon은 바깥 12px·input과 16px 간격을 사용한다.

## Checkbox

공식 근거: [M3 Checkbox](https://m3.material.io/components/checkbox/overview), [Material Web Checkbox](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md), [Checkbox token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-checkbox.scss)

```ts
interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  label: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}
```

- 가시 label을 기본 계약으로 한다.
- indeterminate는 시각 상태와 native form 제출 의미를 구분한다.
- space로 토글하고 focus-visible을 유지한다.
- checkmark와 container의 selected/unselected token을 분리한다.
- disabled는 state layer와 ripple을 생성하지 않는다.
- visual container와 내부 mark는 동일한 18px 좌표를 사용하고, state layer는 40px, wrapper touch target은 48px 기준으로 정렬한다.

## Select

공식 근거: [Material Web Select](https://github.com/material-components/material-web/blob/main/docs/components/select.md), [Outlined Select token](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-outlined-select.scss)

```ts
interface SelectOption<T extends string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps<T extends string> {
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
- popup의 highlighted와 selected 상태를 분리한다.
- arrow key, Home/End, typeahead, Enter/Space, Escape 동작을 실제 흐름에서 검증한다.
- required와 form value를 Base UI form contract와 함께 검증한다.
- popup은 viewport collision을 처리하고 Theme token을 상속한다.
- outlined 값 영역은 floating label과 독립적으로 56px container의 수직 중앙을 유지하고 focus outline은 3px를 사용한다.

## Dialog

공식 근거: [M3 Dialogs](https://m3.material.io/components/dialogs/overview), [Material Web Dialog](https://github.com/material-components/material-web/blob/main/docs/components/dialog.md)

```ts
interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  variant?: 'basic' | 'alert';
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onOpenChange?: (open: boolean, reason: 'trigger' | 'escape' | 'backdrop' | 'action') => void;
}
```

- modal backdrop, focus trap, initial focus, final focus 복원을 검증한다.
- alert variant는 명시적 선택이 필요한 경우에만 사용한다.
- 제목과 설명을 accessible name/description에 연결한다.
- 긴 내용은 content 영역만 scroll하고 action 영역을 잃지 않는다.
- dismiss 가능 여부는 제품 정책으로 명시하며 Base UI 기본값에 암묵적으로 맡기지 않는다.

## Menu

공식 근거: [M3 Menus](https://m3.material.io/components/menus/overview), [Material Web Menus](https://github.com/material-components/material-web/blob/main/docs/components/menu.md)

```ts
type MenuItem =
  | { type: 'item'; id: string; label: React.ReactNode; disabled?: boolean; onSelect(): void }
  | { type: 'checkbox'; id: string; label: React.ReactNode; checked: boolean; onCheckedChange(value: boolean): void }
  | { type: 'radio'; id: string; label: React.ReactNode; value: string }
  | { type: 'submenu'; id: string; label: React.ReactNode; items: MenuItem[] };
```

- highlighted, selected/checked, disabled를 다른 상태로 표현한다.
- keyboard navigation, typeahead, Escape, submenu 방향키를 검증한다.
- popup/document/fixed positioning 중 Base UI positioner를 기본으로 사용하고 custom 좌표는 명시적 adapter로 제한한다.
- item 선택 후 focus가 trigger로 돌아오는지 검증한다.
- submenu의 pointer grace behavior를 시각 효과가 깨뜨리지 않아야 한다.

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
