# WebKit CI 렌더링 실패 교정

## 재현과 원인

사용자는 현재 변경을 외부 브라우저 검증용으로 게시하도록 요청했고, `bad8a02330267baccc0a9c6e678c279e8e056c19`를 `main`에 푸시했다. [원래 CI](https://github.com/clt-joshua/spp-ui-frontend/actions/runs/34085164740)는 Quality/Chromium/Firefox가 성공했지만 WebKit은 35 PASS, 6 FAIL, 1 flaky(14분)였다. 필드 모션의 `Expected a live label transition`과 긴 실제 클릭 흐름의 30초 timeout으로 자동 배포가 차단됐다. Windows WebKit에서 같은 field-motion 4개는 30.1초에 모두 통과했다.

같은 커밋의 앱 빌드와 동일 Linux Playwright 컨테이너에서 두 렌더링 모드를 비교했다. [비교 CI](https://github.com/clt-joshua/spp-ui-frontend/actions/runs/34086615929)의 `Compare WebKit render scheduling`은 실제 `/components#form-fields`에서 입력을 포커스하고 MutationObserver로 생성된 원래 애니메이션을 읽으며, requestAnimationFrame에서 위치와 진행 상태를 관찰한다. 애니메이션을 교체하거나 시간을 변경하지 않는다.

| 관찰 | Headless | Xvfb 화면 모드 |
|---|---|---|
| reduced motion / visibility | false / visible | false / visible |
| 150ms 애니메이션 생성 | 7ms에 관찰 | 5ms에 관찰 |
| 초기 화면 frame 시점 | 34 → 1325 → 1849ms | 6 → 67 → 126 → 189ms |
| 처음 세 frame의 animation 수 | 1 → 0 → 0 | 1 → 1 → 1 |
| 처음 세 frame의 label y | 338.4087 → 329.2813 → 329.2813 | 348.7813 → 333.1367 → 329.5767 |

즉 라벨 애니메이션 생성 누락이나 Windows 모션 감소 설정이 이 CI 실패의 원인은 아니다. Linux headless 렌더링의 긴 프레임 공백이 짧은 모션 관찰과 실제 actionability 대기/테스트 전체 시간에 영향을 주었다. 하위 엔진 내부의 GPU/컴포지터 원인까지 확정한 것은 아니다.

## 변경 범위

- CI의 WebKit만 `xvfb-run ... --headed`로 실행한다. Chromium/Firefox와 Windows 로컬 실행은 그대로다. [Playwright 공식 CI 지침](https://playwright.dev/docs/ci#running-headed)에 따른 화면 모드 실행이며 플랫폼별 PNG 기준을 추가한 것이 아니다.
- `test:e2e:container`도 같은 WebKit 실행 방식을 사용한다.
- 수동 CI 실행에는 `scripts/diagnose-webkit-motion.mjs` 비교 관찰을 남긴다. 일반 push/PR에는 진단을 중복 실행하지 않는다.
- 화면 모드의 첫 전체 비교는 기존 필드 실패를 해결했지만 40 PASS/1 FAIL/1 flaky였다. 남은 Select 실패는 여러 layout/visibility 왕복 이후 완료된 500ms animation을 `getAnimations()`로 뒤늦게 찾은 테스트 관찰 경쟁이었다. 실제 클릭 전에 portal의 DOM 변경을 관찰하고 생성된 원래 animation의 duration/keyframe을 기록하도록 교정했다. 500ms 단언은 유지하며 실제 height keyframe 0→양수도 추가 검증한다. 실제 메뉴 진입·노출·선택·재열림/focus 검증은 그대로다.
- Ripple의 450/105/375ms CSS 확인도 짧게 존재하는 동일 wave에서 한 번에 읽는다. 세 번의 프로토콜 왕복 사이에 정상 제거된 DOM을 찾던 flaky 관찰을 줄이며 수치·실제 keyboard/pointer 동작 단언은 유지한다.
- `050d148`의 [main CI](https://github.com/clt-joshua/spp-ui-frontend/actions/runs/34087651299)에서는 Tabs의 keyup 후 ripple count 단언도 실패했다. composite Tab은 keydown에서 활성화되므로 중간 pressed-state CSS 검사가 끝날 때 이미 ripple이 제거될 수 있다. keydown 전에 실제 DOM 생성 관찰을 시작하여 wave 1개 생성/동시 1개/최종 제거 및 선택 상태를 검증하도록 교정했다. 실제 keyboard 입력이나 앱 시간을 대체하지 않는다. 로컬 Chromium/Firefox/WebKit 해당 흐름 3개는 retry 0으로 모두 통과했다.
- 제품 코드, Figma 토큰, MD3 모션 시간, OS 설정, 기대 수치/timeout/retry는 변경하지 않는다. 테스트를 skip하거나 배포의 CI 성공 조건을 우회하지 않는다.
- 기존 대비·Snackbar 정책·실제 AT/Windows Contrast Themes 준수 BLOCKED는 그대로 유지한다.

## 검증 및 게시

최종 교정 후 로컬 `pnpm verify`는 구조·ESLint·TypeScript·46개 단위 테스트·앱/Storybook 빌드를 모두 통과했다. 수정된 Select 및 Ripple 실제 흐름은 Chromium/Firefox/WebKit에서 각각 통과했다(총 6개, retry 0). 제품 소스 diff는 없으며 최종 전체 main CI와 자동 Pages 게시 결과는 별도로 확인한다.

비교 실행 및 최종 main CI/Pages 결과는 해당 커밋의 Actions와 공개 산출물 readback으로 판정한다. 앱 산출물은 기존 `index-DfOwUzAP.js` / `index-C_p2ztRC.css`이며 이번 교정은 CI 실행 방식에 한정된다. 로컬 Docker는 기동 오류로 동일 컨테이너 재현에 사용할 수 없어, GitHub의 실제 동일 이미지에서 비교했다. 다운로드한 기존 실패 trace는 로컬 `test-results/ci-34085164740`에 보존했다.
