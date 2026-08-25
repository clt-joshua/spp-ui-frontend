# 현재 상태

관찰일: 2026-08-25

## 결론

프로젝트는 Vite reference host와 UI foundation 단계다. 문서 분류, Node 24/pnpm 10.33 toolchain, React 19 Vite 진입점, self-hosted Roboto/Material Icons, `src/ui` 경계, GitHub Actions, 3-browser E2E와 Linux visual baseline이 연결됐다. Theme Runtime과 8개 MVP 컴포넌트는 아직 없으므로 UI 시스템 제품 기능이 구현되었다고 볼 수 없다.

## 저장소 상태

- Git branch: `main`
- Git history: 최초 foundation 커밋 생성
- Remote: `https://github.com/clt-joshua/spp-ui-frontend.git`
- Remote branch readback: `origin/main`과 local `main` 동기화
- 분류한 기존 문서와 scaffold, CI/visual baseline을 최초 커밋으로 추적
- 원본 문서 9개는 분류 이동 시점에 해시 보존을 확인했고, 이후 확정된 host/runtime/asset 결정을 관련 문서에 반영

## 환경 관찰

현재 기본 shell의 Node는 25지만 프로젝트 install과 전체 검증은 별도 Node 24.19.0 runtime으로 수행했다.

| 도구 | 관찰값 |
|---|---|
| Node.js | `v25.2.1` |
| 검증 Node.js | `v24.19.0` |
| pnpm | `10.33.0` |
| npm | `11.14.0` |
| Git | `2.55.0.windows.3` |

## 준비도

| 영역 | 상태 | 증거 또는 다음 게이트 |
|---|---|---|
| 문서 분류와 탐색 | 준비됨 | `docs/README.md` |
| 프로젝트 운영 메모리 | 준비됨 | `PROJECT_MEMORY.md`, `docs/project-memory/**` |
| M3/Material Web 기준선 위치 | 준비됨 | `src/ui/compliance/**` |
| `src/ui` 폴더 경계 | 준비됨 | `src/ui/README.md`, `src/ui/index.ts`, ESLint restriction |
| 앱 호스트와 실제 진입점 | 준비됨 | Vite 8 + React 19, `src/main.tsx` |
| package/toolchain baseline | 준비됨 | Node 24.19.0, pnpm 10.33.0 |
| 의존성·lockfile | 준비됨 | `package.json`, `pnpm-lock.yaml` |
| 기본 아이콘·서체 | 준비됨 | `MaterialIcon`, Roboto/Material Icons self-host |
| CI quality gate | 준비됨 | Node 24 frozen install, structure/lint/typecheck/build, actionlint |
| E2E 환경 | 준비됨 | Chromium/Firefox/WebKit, foundation flow 6건 PASS |
| visual baseline | 준비됨 | digest-pinned Chromium/Linux, Light/Dark × 3 viewport 6건 PASS |
| token/Theme runtime | 미구현 | 구현 단계 2~3 |
| interaction과 8개 컴포넌트 | 미구현 | 구현 단계 4~5 |
| MVP 키보드·Portal 검증 | 실행 불가 | Theme/overlay/component 구현 후 가능 |

## 분석된 계약

- UI는 앱 내부 `src/ui`에서 시작하고 화면은 공개 index만 사용한다.
- Base UI는 behavior authority, M3 token은 visual authority, Material Web은 runtime이 아닌 reference다.
- Theme은 document root에 원자적으로 적용해 body Portal도 같은 role을 상속해야 한다.
- foundation → interaction → component vertical slice 순서를 지켜야 한다.
- Storybook과 테스트는 보조 증거이며 실제 앱 흐름이 완료 증거다.

## 이번 준비 작업의 검증

- Node.js 24.19.0에서 `pnpm install`: PASS
- Node.js 24.19.0에서 `pnpm verify`: PASS
- 구조 검사 필수 파일 40개, 디렉터리 17개, Markdown 19개, MVP manifest 8개 확인
- ESLint import boundary, TypeScript project reference typecheck, Vite production build: PASS
- Vite production preview `http://127.0.0.1:4173/`: HTTP 200, JS/CSS asset HTTP 200
- Base UI 외부 import 차단/내부 허용 및 Material Web runtime 전역 차단: PASS
- build와 lockfile의 `@material/web`/Lit runtime 부재: PASS
- Playwright Chromium/Firefox/WebKit foundation E2E 6건: PASS
- digest-pinned Chromium/Linux visual baseline 6건 생성 후 재비교: PASS
- baseline 총량 413,324 bytes, 25MB 운영 기준 이내
- GitHub Actions workflow actionlint 1.7.12: PASS
- 이동한 기존 문서 9개의 SHA-256은 분류 직후 동일함을 확인했으며 이후 승인 결정을 문서에 반영
- foundation browser flow는 검증했으나 Theme Runtime, Portal, MVP component interaction은 아직 수행하지 않음

## 다음 구현 진입점

1. token graph와 root/Portal Theme Runtime을 구현한다.
2. `m3-component-manifest.ts`를 기반으로 각 컴포넌트 compliance record를 생성한다.
3. foundation → interaction → component vertical slice 순서로 실제 앱 흐름을 검증한다.
