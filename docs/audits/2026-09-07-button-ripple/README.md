# Button / IconButton Ripple 교정

## 계약 및 근거

- 사용자 승인: Button은 직전 점검의 pressed 중복 합성 제거 방향을 적용하고, IconButton Ripple은 Material Web 원본 동작으로 정렬한다.
- [Material Web Ripple TS](https://github.com/material-components/material-web/blob/main/ripple/internal/ripple.ts): pointer origin → center, keyboard synthesized click → center; 450ms grow, 225ms minimum, 150ms touch delay.
- [Material Web Ripple CSS](https://github.com/material-components/material-web/blob/main/ripple/internal/_ripple.scss): hover surface + radial pressed surface, 105ms fade-in / 375ms fade-out. 별도 전체 pressed 배경은 없다.
- 이번 조회에서 위 두 파일의 main과 pinned `b4de401eb665ec63474f39319a4ba8f2145974cc` 내용은 동일했다. SHA256: TS `2cbd16b8f93b0f54b4a02f820277b2c28ee647ccddc92fda21de213130f9525e`, SCSS `45a71762bb23c62b9b94d01a706d254928fad04bb09357ab54a734b417fa0d29`.
- 직전 MCP 점검의 Figma IconButton `10724:16368`, 상세 `10446:79834`, `10446:80074`, `10446:79914`: container 40/32/24px, icon 24/20/16px, padding 8/6/4px. 실제 5174의 60개 matrix 샘플도 일치했다. 이번 변경에서 geometry는 바꾸지 않는다.

## 변경

- Button: 정적 pressed wash를 제거하고 Light/Standard Figma black 16%를 Ripple color에 연결한다. 이미 alpha가 있으므로 surface opacity는 1이다. Dark/High는 currentColor × 10%로 어두운 surface에서도 전경 기반 피드백을 유지한다. 이 테마 대응은 별도 Figma Dark endpoint라는 주장이 아니다.
- IconButton: centered 강제를 제거하고 pointer 시작 좌표를 공통 primitive에 전달한다. 현재 icon 전경색 × 10% Ripple만 pressed 피드백으로 사용한다.
- 두 컴포넌트의 기존 hover/focus wash, FocusRing, disabled, API, geometry, pressed elevation 및 선택 의미를 보존한다. 따라서 Ripple 교정이 컴포넌트 전체의 Material Web 기본 시각값 일치를 의미하지 않는다.
- 공통 Ripple 시간/gradient/입력 처리와 다른 컴포넌트의 토큰은 변경하지 않는다. 기존 드롭다운 미커밋 변경을 보존한다.

## 회귀 및 검증 상태

- `tests/e2e/button-ripple.spec.ts`: 실제 Theme Lab에서 mode/contrast 적용 → `/components` 이동. Light/Dark × Standard/High, normal/reduced motion, 5 Button styles와 3 IconButton sizes의 실제 edge press 좌표·색상·opacity·450ms grow·중복 wash 부재·release 제거, keyboard center, disabled suppression을 검사한다.
- 기존 foundation의 Button/IconButton Space held 검사는 obsolete 16% 전체 wash 대신 기존 12% focus wash 보존을 검사한다. 새 회귀가 별도 Ripple 색상과 origin을 검증하므로 과거 구현에 기대값을 맞추는 변경이 아니다.
- 최종 quality/E2E 및 실제 5174 readback은 아래와 같다. 기존 Windows Contrast Themes 및 Button 대비 정책 BLOCKED는 유지한다. 커밋/푸시/배포는 이번 요청 범위가 아니다.

## 실제 5174 앱 readback

독립 Chromium에서 Theme Lab → 라이트/다크 선택 → 테마 적용 → Actions의 Filled edge hold 및 공유 IconButton edge hold → 컴포넌트 검증 진입을 실행했다. fixture나 Storybook을 사용하지 않았다.

- Light: 연속 프레임 grow scale `1.15 → 4.58 → 7.49 → 9.04 → 9.73`, surface opacity `0.159 → 0.635 → 1`. radial 색상 `rgba(0,0,0,0.16)`, 뒤의 전체 layer는 hover `rgba(0,0,0,0.06)`로 유지됐다.
- Dark: grow scale `1.15 → 4.58 → 7.48 → 9.04 → 10.00`, opacity `0.0159 → 0.0635 → 0.1`. 전경 `rgb(0,54,62)`를 사용했고 pressed black 16% 전체 wash는 없었다.
- 공유 IconButton: visual 40px, padding 8px, wave size 8px. 실제 x=5px press에서 `start-x=1px`, `end-x=16px`여서 파동 중심은 5px에서 20px로 이동한다. 이전 centered 강제에서는 둘 다 16px였을 값이다.
- `/components`의 60개 IconButton matrix로 자연스럽게 진입하고 small action을 클릭했다. Light/Dark 테스트용 독립 context만 변경했고 사용자 OS 설정은 변경하지 않았다.
- 앱 내 브라우저의 제한된 evaluate 환경은 `performance.now`를 제공하지 않아 프레임 sampling 시도가 실패했다. 동일 실제 앱 URL을 사용하는 독립 Chromium에서 위 프레임 readback을 완료했다. 앱 내 브라우저 프레임 감사가 성공했다고 보고하지 않는다.
- 앱 내 브라우저에서 별도 정적 readback은 성공했다: Dark Button `--md3-ripple-color=currentColor`, `--md-ripple-pressed-opacity=0.1`; 공유 IconButton width 40px/padding 8px.

## 검증 대상 artifact

- 로컬 worktree, 기존 배포 HEAD `4c9ca38f334fc0c6b3ddc750c900b28933ab551f` 위 미커밋 변경. 이 감사는 production을 검증하지 않는다.
- JS `index-C5SHrcCV.js`: SHA256 `0f0addc6ec6ab98b0d775040367124ad0e5602d42decdf730506d7059a225a22`.
- CSS `index-C1-ci9f6.css`: SHA256 `668dc8bc7693c7f6fa1aa18e42181a6e261556768227ea13d58c7c5f6209a472`.
- `pnpm verify` PASS: structure, lint, TypeScript, Vitest 9 suites/46 tests, Vite 및 Storybook build. 후속 문서/manifest 변경 뒤 lint와 structure/diff whitespace 검사도 PASS.
- `pnpm test:e2e --retries=0` PASS: Chromium/Firefox/WebKit 각 58개, 전체 **174/174** 단일 실행 통과(14.9분). 새 Ripple 회귀 12개와 기존 touch/keyboard/geometry/폼/overlay 회귀를 포함하며 재시도나 실패를 숨기지 않았다.
