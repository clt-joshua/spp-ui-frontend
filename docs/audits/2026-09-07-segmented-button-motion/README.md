# SegmentedButton 선택 모션

**이 구현은 사용자 검토에서 거부되어 대체됐다.** clip reveal/역방향 transition과 이를 확인한 126개 PASS는 Labs 일치 근거가 아니다. 최신 구현과 원본 기반 회귀는 [Labs 교정 감사](../2026-09-07-segmented-button-labs/README.md)를 따른다.

## 적용 범위와 근거

사용자의 “SegmentedButton 도 애니메이션 적용” 요청으로 선택 영역 펼침/접힘, 체크 표시, 기존/사용자 아이콘 fade를 적용했다. 공개 API, native button·aria-pressed, single 비해제, multiple toggle, disabled 의미론은 유지한다. Theme Lab → 컴포넌트 검증 → Navigation(`/components#navigation`)에서 실제 공개 컴포넌트로 사용할 수 있다. 프로젝트 전용 구현 스킬에 따라 컴포넌트 토큰, 검증 페이지, Storybook, 회귀와 compliance 기록을 함께 갱신했다.

공식 참고는 [Material Web Labs _shared.scss](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/labs/segmentedbutton/internal/_shared.scss)와 같은 revision의 `segmented-button.ts`다. Stable 대응 컴포넌트는 없으므로 사용자 승인 범위의 프로젝트 확장으로 기록한다. Labs/Lit 런타임이나 Expressive spring을 도입하지 않았다. Figma `10724:13951`의 기존 감사 endpoint(32px 높이, 12px padding, 8px gap, 18px icon, typography와 theme color)를 유지했고 이번 후속에서 Figma 전 variant를 재조회한 것은 아니다.

## 모션 계약과 명시적 차이

| 대상 | 적용 |
|---|---|
| leading 영역 | 0↔18px 및 gap 보정 margin, 150ms standard `cubic-bezier(.2,0,0,1)` |
| 기본 체크 | 50ms 지연 후 150ms standard reveal, 해제 50ms linear fade |
| 기존 labeled icon | 선택 시 75ms linear fade-out, 해제 시 50ms 지연 후 150ms linear fade-in |
| 사용자 selectedIcon | 50ms 지연 후 150ms linear fade-in, 해제 50ms fade-out |
| icon-only / hideSelectedIcon | 원래 아이콘 옆에 check 추가 / check와 그 전환 없음 |
| 초기 상태 / disabled / reduced-motion | 초기 선택은 정적, disabled와 reduced-motion은 즉시 최종 상태 |

Labs는 SVG stroke를 그린다. 프로젝트는 Figma Material Icons Filled glyph 및 교체 가능한 icon adapter를 유지하기 위해 **clip reveal**을 사용한다. 사용자 glyph는 fade한다. 이 차이와 disabled/reduced-motion 정지는 프로젝트 정책이지 Labs 원본과 동일하다는 주장이 아니다. 배경색은 원본처럼 즉시 바뀌며 슬라이딩 배경이나 shape morph는 추가하지 않았다.

decorative glyph를 계속 mount해 해제와 빠른 재선택을 CSS가 현재 값에서 보간한다. 모두 aria-hidden이고 접근명은 label에 남는다. 기존 단위 테스트의 DOM 제거 기대는 지속 mount + data-visible 계약으로 수정했으며 선택 의미론은 바꾸지 않았다. 테스트용 공개 상태나 별도 동작 경로를 추가하지 않았다.

## 검증

- Node 24.19.0 프로젝트 runtime에서 `pnpm verify` PASS: 구조·lint·typecheck, 단위 9 suites/45 tests, Vite/Storybook build. 기존 bundle 크기 warning은 남는다.
- `pnpm test:e2e` 전체 **126/126 PASS (8.3분)**: Chromium/Firefox/WebKit 각각 42개, 단일 전체 실행, 실패·재시도 없음. 이 중 SegmentedButton 전용 모션은 3×3=9개다. 실제 `/` → `/components#navigation`에서 width 중간 frame 및 그룹 폭 유지, check/icon timing, icon-only, hide/custom, single 재선택, Space, 빠른 역전, disabled/reduced-motion을 확인했다. 기존 Figma geometry/color와 전체 컴포넌트 회귀도 통과했다.
- `pnpm exec node scripts/audit-segmented-motion.mjs` PASS: 실제 5174 Theme Lab에서 Normal Light/Dark × Standard/High를 적용하고 Navigation에 진입했다. 네 조합 모두 leading 0→18px 중간 frame, group width 516px 유지, Space 해제/재선택, 사용자 아이콘, reduced-motion 0s, page error 0. [readback](runtime/themes.json), [Light](runtime/light-standard.png), [Dark](runtime/dark-standard.png). 두 Standard 스크린샷을 직접 열어 선택 텍스트와 정렬을 확인했다.
- 첫 runtime 수집은 병렬 build 중 고정 350ms 관찰 종료 시 width 9.90625px여서 실패했다. 수집기가 CSS 완료까지 기다리도록 고쳤고 중간 frame·최종 18px·그룹 폭 검증은 유지했다. 제품 타이밍이나 선택 계약을 완화하지 않았다. Node 24로 재실행한 네 테마 readback은 모두 통과했다.
- 현재 빌드 identity: `index-Cry5CG_V.js`, `index-BqydIOil.css`. 전체 회귀는 이 산출물을 사용한다.

전체 M3 준수 PASS가 아니며 실제 screen reader/Windows Contrast Themes와 기존 다른 컴포넌트의 blocker는 해소한 것으로 표시하지 않는다. 커밋·푸시·배포는 수행하지 않는다.
