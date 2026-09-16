# 이관용 main 통합 검증

## 대상과 결정

- 로컬 `0e49c15b7f410271883a97d91d534595060bb107`과 원격 `3acb2ce0e0a7bb44db113d71b1872b909be886f4`는 공통 부모에서 갈라진 이력이다.
- 사용자 결정은 DataGrid를 유지하며 기존 공개 저장소 main에 업로드하는 것이다. 두 이력을 병합하며 강제 푸시는 사용하지 않는다.
- DataGrid 구현, 토큰, TanStack 의존성, `/grid` 예제와 기존 감사 PNG를 보존한다. 로컬의 Snackbar 제거, Figma 토큰 우선 정책, 라벨·체크 모션 및 컴포넌트별 탐색도 보존한다.
- 공통 헤더로 `/`, `/components`, `/grid`를 연결하고 갤러리 registry에 DataGrid를 추가해 공개 목록을 14종으로 통합했다. 기존 그리드 검증 링크 `/components#data-grid`도 유지한다.
- 서버 API나 저장 계약을 추가하지 않았다. Grid 예제 편집은 기존처럼 현재 화면에서만 유지된다.

## 검증

- `pnpm install --frozen-lockfile` PASS.
- `pnpm verify` PASS: 구조, lint, TypeScript, 12 suites / 53 unit tests, Vite 및 Storybook 빌드.
- 실제 앱 내 브라우저에서 홈의 공통 헤더 → `/grid` → REQ-001 선택 및 담당자 편집 → 그리드 컴포넌트 검증 링크를 따라갔다. 선택 수 `1개`, 담당자 `이관 확인`, 갤러리의 `14개 컴포넌트`와 DataGrid 행렬을 직접 확인했다.
- 로컬 production preview 포트 4186을 사용했다. Vite 산출물은 `index-DyufvDWE.js`, `index-BHct_3ud.css`다.
- 영향 범위 E2E는 app-header, grid, grid-theme, component-gallery, theme-settings, snackbar-removal의 6개 파일을 Chromium/Firefox/WebKit에서 retries 0으로 실행해 **42/42 PASS**(각 14개, 2.3분)를 확인했다.

## 한계와 배포

- 과거 양쪽 브랜치의 전체 E2E 결과를 이번 통합 결과로 합산하지 않는다. 전체 회귀는 이번 커밋의 GitHub CI에서 확인한다.
- 수동 스크린리더 및 Windows Contrast Themes 미검증 상태는 유지한다. Figma 색상 대비는 제품 정책상 비차단이며 WCAG 준수 완료를 주장하지 않는다.
- 기존 GitHub CI 성공 → Cloudflare Pages 자동 배포 경로를 유지한다. 업로드·CI·공개 배포 결과는 실제 해당 커밋과 산출물로 각각 확인한다.
