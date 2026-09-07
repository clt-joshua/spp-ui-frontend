# SegmentedButton Labs 원본 동작 교정

## 후속 사용자 환경 진단 및 게시 요청

사용자가 실제 앱 내 탭에서 모션이 보이지 않는다고 보고해 해당 탭을 직접 확인했다. `prefers-reduced-motion: reduce=true`였고, 클릭 시 `aria-pressed=true`/`data-selection-motion=selecting`은 정상 변경되지만 graphic transition과 check animation은 `none`이었다. Windows `SystemParametersInfoW(SPI_GETCLIENTAREAANIMATION=0x1042)` 읽기는 성공/값 0(애니메이션 비활성화), 일반 Chrome도 reduce=true를 반환했다. Chromium이 읽는 Windows 설정과 일치한다. OS/브라우저 설정과 CSS는 변경하지 않았다.

아래 프레임 감사와 자동 테스트는 별도 검증 브라우저 환경의 증거이며 실제 사용자 탭에서 기본 모션이 보인다는 증거로 해석하지 않는다. 이후 사용자가 다른 브라우저에서 검증하기 위해 현재 변경의 기본 브랜치 커밋 및 게시를 요청했다. `main`의 기존 CI → Pages 자동 배포 경로를 사용하며, 기존 M3 준수 blocker는 유지한다. 아래의 ‘배포 없음’은 해당 감사 실행 시점의 상태다.

## 원인과 권위 복원

사용자가 이전 구현의 동작을 거부하고 Material Web Labs 코드 기반 구현을 명시적으로 요청했다. 이전 126개 테스트 PASS는 기능 회귀 증거였지만 Labs 모션 일치의 증거가 아니었다. 이전 감사에서 자의적으로 선택한 font glyph clip reveal과 역방향 transition을 제품 계약으로 굳힌 것은 **AUTHORITY INVERSION**, 해당 기대값을 보존하는 것은 **TEST DRIFT**다. 이번 요청에 따라 이 구현과 기대를 폐기했다. 이전 파일·스크린샷은 역사적 증거로 남긴다.

원본: [segmented-button.ts](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/labs/segmentedbutton/internal/segmented-button.ts), [_shared.scss](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/labs/segmentedbutton/internal/_shared.scss), [set behavior](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/labs/segmentedbuttonset/internal/segmented-button-set.ts). live main 소스도 확인했다. Stable 전체 컴포넌트로 승격한 것은 아니며 사용자 승인된 SegmentedButton 범위에서만 Labs를 구현 근거로 사용한다.

## 실제 변경

- `nextAnimationState`에 대응하는 이전 selected → 현재 selected로 `selecting`/`deselecting`을 결정한다. React render 단계에서 결정하므로 effect 실행 전 fully drawn check가 깜박이지 않는다. 초기 mount와 disabled 재활성화는 선택 animation을 재생하지 않는다.
- `leading → graphic → check/icon` 구조. graphic width에 icon 18px + gap 8px를 포함해 0↔26px, 150ms standard로 전환한다. 이전 음수 margin 보정과 flex gap을 제거했다. icon-only는 graphic 옆에 원래 icon을 유지한다.
- 기본 체크는 원본 SVG `M1.73,12.91 8.1,19.28 22.79,4.59`, stroke 2px, dasharray 29.7833385. 50ms delay 동안 dashoffset을 시작값으로 유지하고 150ms standard keyframe으로 0까지 그린다. Figma 18px canvas/color를 유지하되 font 체크를 원본 motion용 SVG로 교체한다.
- selecting: labeled icon 75ms linear fade-out. deselecting: check 50ms fade-out, labeled icon은 opacity 0에서 50ms 기다린 후 150ms linear fade-in. 빠른 반전은 graphic width만 현재 값에서 이어지고, check/icon keyframe은 원본처럼 선택 방향에 맞춰 교체·재시작한다.
- 공개 custom `selectedIcon`은 그릴 path를 강제할 수 없어 delayed fade를 유지한다. `hideSelectedIcon`은 원래 icon을 숨기지 않는다. disabled/reduced-motion의 정적 최종 상태는 기존 프로젝트 접근성 예외로 남긴다. Labs에 이 예외가 있다는 주장은 하지 않는다.
- single 재선택 비해제, multiple toggle, native Tab/Space/Enter, disabled callback 억제와 aria-pressed 유지. Figma 32px container/12px padding/18px icon/8px 실제 gap/theme color와 그룹 균등 열은 유지한다. 슬라이딩 배경·spring·shape morph는 원본에도 없어 추가하지 않는다.
- 원본 고지와 Apache-2.0 라이선스 사본을 포함하며 런타임 package import는 없다. 프로젝트 스킬에 따라 실제 `/components#navigation`, 문서·회귀·compliance를 함께 갱신했다.

## 검증과 한계

원본에서 도출한 SVG/path·graphic·keyframe 회귀는 이전 산출물 `index-Cry5CG_V.js`에서 세 케이스 모두 FAIL했다(path 없음, selection phase 없음). 새 테스트의 타입 오류로 첫 build가 실패한 뒤 이어진 실행이 이전 산출물을 사용했으므로 이를 새 구현 실패로 섞지 않는다. 새 빌드의 첫 Chromium 실행은 2 PASS/1 FAIL: reduced-motion selector 우선순위 때문에 draw animation이 남는 실제 문제를 발견했고 selector를 교정했다. 기대값을 완화하지 않았다.

최종 품질 게이트·실제 5174 readback·3-browser 실행 결과는 아래에 기록한다. Figma 모든 variant 재조회나 Labs/Lit 원본 runtime 동시 실행은 수행한 것이 아니며, 고정 공식 소스 계약과 실제 React 앱의 CSSAnimation/geometry/state를 대조한다. 기존 다른 컴포넌트 대비·정책 및 실제 AT/Windows Contrast Themes blocker는 별도다. 커밋·푸시·배포 없음.

- 최종 `pnpm verify` PASS: Node 24.19.0, 구조·lint·typecheck, 9 suites/46 unit tests, Vite/Storybook build. 기존 bundle-size warning만 남는다. controlled selection 변경과 disabled 재활성화의 불필요한 재생 방지 단위 회귀를 추가했다.
- JSX 들여쓰기 정리 후 재빌드에서도 `index-DfOwUzAP.js` / `index-C_p2ztRC.css`가 동일해 최종 코드의 실행 산출물이 테스트한 것과 같음을 확인했다. 라이선스 정적 경로도 preview에서 HTTP 200 및 Apache License 본문을 확인했다.
- 실제 5174 Theme Lab → 컴포넌트 검증 → Navigation에서 Normal Light/Dark × Standard/High 모두 PASS. 매 프레임 graphic 0→26px와 SVG dashoffset 중간 값→0, 그룹 516px 유지, Space 해제/재선택, custom icon, reduced-motion animation none, page error 0을 readback했다. [프레임 기록](runtime/themes.json), [Light](runtime/light-standard.png), [Dark](runtime/dark-standard.png). 두 Standard 스크린샷을 직접 열어 최종 체크·텍스트 정렬을 확인했다.
- E2E 산출물: `index-DfOwUzAP.js` / `index-C_p2ztRC.css`. **전체 126/126 PASS(8.2분)**, Chromium/Firefox/WebKit 각 42개, 단일 실행/재시도 없음. 원본 기반 전용 모션 회귀 3×3=9개와 기존 Figma/전체 앱 회귀를 포함한다. 이전 clip 구현의 126 PASS와 구분한다. CSSAnimation의 실제 delay/duration/keyframe을 25/125/200ms로 읽어 체크 draw와 icon fade를 대조했고, 자연 시간의 중간 frame 및 실제 click/Space/Enter 흐름도 별도로 통과했다.
