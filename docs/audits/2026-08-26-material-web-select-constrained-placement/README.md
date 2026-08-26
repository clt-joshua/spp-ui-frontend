# Material Web Select constrained-placement follow-up

## 결론

하단 공간 부족 시 Portal mount 또는 첫 positive geometry만으로 animation을 시작하던 수명주기를 폐기했다. 공용 menu motion adapter는 Base UI Positioner의 최종 side·opacity·stable rect를 확인한 뒤, full-size Popup을 position shell로 유지하고 nested visual surface만 전환한다. collision 계산과 visual height를 분리해 opening 중 side가 바뀌지 않으며, 선택 option의 focus/scroll은 완료 뒤에 적용한다.

## 공식 구현 근거

- [Material Web Select 내부 구현](https://github.com/material-components/material-web/blob/main/select/internal/select.ts)은 field `end-start`와 menu `start-start`, `quick=false`를 사용한다.
- [Material Web Menu 내부 구현](https://github.com/material-components/material-web/blob/main/menu/internal/menu.ts)은 positioning controller의 `onOpen` 뒤에 `animateOpen()`을 시작하고, 500ms height·50ms surface opacity·250ms item stagger를 완료한 후 focus를 적용한다.
- [Material Web SurfacePositionController](https://github.com/material-components/material-web/blob/main/menu/internal/controllers/surfacePositionController.ts)는 surface를 투명하게 paint한 뒤 측정·flip·resize·position을 끝내고 `onOpen`을 호출한다. 위쪽 flip은 `inset-block-end`를 사용하므로 height가 변해도 anchor 쪽 bottom edge가 유지된다.

## 변경된 계약

1. Popup과 Positioner ref를 모두 motion adapter에 전달한다.
2. `data-side`, Positioner opacity, positive geometry, 두 frame 연속 0.5px 이내의 동일 rect를 readiness로 사용한다.
3. `scrollHeight` 대신 rendered/clamped `offsetHeight`를 animation end height로 사용한다.
4. Popup shell은 측정된 full height를 animation 동안 유지하고, nested `menu-surface`에만 height/opacity animation을 적용한다.
5. `side=top` visual surface는 shell bottom에 고정하고 내부 content에만 `translateY(-height) → none`을 적용한다.
6. Base UI가 먼저 요청한 option focus/`scrollIntoView`는 opening 완료 뒤에 실행한다.
7. 12 frame 안에 최종 배치를 얻지 못하면 숨겨진 surface를 남기지 않고 fail-open한다.

## 중복 anchor 보정 회귀

초기 adapter는 Material Web의 `inset-block-end`를 물리 좌표로 흉내 내기 위해 popup에도 `translateY(height) → none`을 적용했다. 그러나 Base UI Positioner는 ResizeObserver/Floating UI 배치를 통해 animated popup height를 이미 따라가므로 보정이 두 번 적용됐다. 그 결과 첫 frame이 trigger 아래, 실제 화면에서는 viewport bottom 부근에서 시작해 위로 솟았다. 공식 구현과 동일하게 surface height + content correction으로 분리해 이 popup transform을 제거했다.

## 중간 높이 collision 재계산 회귀

Popup transform을 제거한 뒤에도 Base UI는 Popup height animation을 ResizeObserver로 관찰했다. 첫 full-height 계산에서는 `top`이 선택되지만, height가 0에 가까운 opening frame에서는 `bottom`도 들어가므로 collision middleware가 아래로 재배치하고, 높이가 증가하면 다시 `top`으로 flip했다. Material Web은 full-size surface를 먼저 position한 뒤 해당 좌표에서 animation하며 중간 높이를 새 collision 입력으로 사용하지 않는다. 현재 adapter도 full-size Popup shell을 위치 authority로 두고 내부 visual surface만 애니메이션한다.

## 검증

| 항목 | 결과 |
|---|---|
| `pnpm typecheck` | PASS |
| `pnpm verify` | PASS — structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| 실제 Vite 기본 open → close → reopen | PASS — early frame에 trigger focus·opening phase·surface 156.27px·popup transform `none`, settled에 option focus·184px·opacity `1/1/1`; 재열림도 같은 순서 유지 |
| constrained placement 회귀 사양 | 추가 — 832×480, `side=top`, scrollY 불변, opening bottom gap ≤ 1px, height 단조 증가, 완료 뒤 option focus |
| popup/content animation 분리 사양 | 추가 — top placement에서 popup transform animation 0건, list content `translateY(-height) → none` 1건 |
| opening side stability 사양 | 추가 — 모든 sampled frame에서 `data-side=top`, shell bottom gap ≤ 1px, nested surface height만 단조 증가 |
| 현재 in-app browser 제한 배치 자동 클릭 | 판정 제외 — 브라우저 제어가 이미 viewport 안의 TextField/Select도 중앙으로 스크롤함을 대조 확인하여 실제 pointer 흐름의 collision 조건을 보존하지 못함 |
| standalone Playwright 실행 | 미실행 — 현재 Browser 검증 세션의 표면을 유지함 |

자동 클릭의 도구 유발 스크롤을 제품 결함 증거로 사용하지 않았다. 전용 회귀 사양은 `tests/e2e/foundation.spec.ts`에 남겼으며 다음 pinned E2E 실행에서 authoritative readback 대상이다.

## 캡처

- `01-official-constrained-closed.png`: 공식 Select를 하단 제약 위치에 둔 닫힘 기준 화면.
- `03-current-constrained-closed.png`: 현재 Theme Lab의 자연 배치에서 field bottom 아래 여유가 44.625px인 닫힘 화면.
- `02-official-constrained-opening.png`, `04-current-constrained-opening.png`: 자동 클릭으로 페이지가 중앙 스크롤된 도구 동작 기록이며 정합성 비교 증거에서 제외한다.
