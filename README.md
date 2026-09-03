---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# React MD3 + Base UI UI 시스템

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 목적

이 문서 세트는 짧은 개발 기간 안에 React 기반 UI를 구축하면서도 다음 결과를 달성하기 위한 실행 기준서다.

- Base UI를 접근성·키보드·포커스·팝업 동작의 headless 기반으로 사용한다.
- Material Web을 런타임에 병행하지 않고 공식 Web 구현의 비교 기준으로 사용한다.
- M3 reference → system → component token 계층을 CSS Variables로 구축한다.
- Primary seed color로 Light/Dark 및 대비별 전체 컬러 스킴을 생성한다.
- state layer, ripple, focus indicator와 stable M3 motion을 공통 primitive로 구현한다.
- 화면 코드가 Base UI와 구체 토큰 값을 직접 사용하지 않도록 디자인 시스템 경계를 만든다.
- 각 컴포넌트가 어떤 공식 스펙을 구현하는지 증거로 추적한다.

## 확정된 기술 결정

| 항목 | 결정 |
|---|---|
| 대표 앱 호스트 | Vite 8 + React 19 + TypeScript, `src/ui`는 host-neutral 유지 |
| 지원 Runtime | Node.js 24.x, pnpm 10.33.x |
| UI 동작 기반 | `@base-ui/react@1.7.0` |
| 동적 컬러 | `@material/material-color-utilities@0.4.0` |
| Material Web | 런타임 미설치, 공식 문서·v2.5.0 구현 비교 전용 |
| 스타일 | CSS Variables + CSS Modules |
| Figma foundation | 250 color, 34 text style, 18 number → 18 space/17 gap/8 radius, 5 elevation effect style |
| 기본 아이콘 | self-hosted Google Material Icons Filled, `MaterialIcon` adapter로 격리 |
| 기본 서체 | self-hosted Noto Sans Variable, CSS 변수로 브랜드/본문 서체 교체 가능 |
| Theme variant | MVP는 `TonalSpot` 고정 |
| Theme 기능 | Light/Dark/System, Standard/High, 프리셋 4종, 사용자 HEX |
| 공개 컴포넌트 | Button, IconButton, TextField, Checkbox, Radio, Tabs, Switch, SegmentedButton, Chip, Select, Dialog, Menu, Snackbar |
| Expressive motion | Web 공식 구현 전까지 제품 코드에서 제외 |
| 초기 배치 | 애플리케이션 내부 `src/ui` 모듈 |

Material Web의 공식 Web 페이지와 로드맵은 현재 라이브러리가 유지보수 모드이며 M3 Expressive가 Web에 구현되지 않았다고 안내한다. 따라서 안정 Web 스펙만 제품 코드의 준수 대상으로 삼고, Expressive 항목은 `deferred`로 추적한다.

## 로컬 실행

Node.js 24.19.0과 pnpm 10.33.0을 기준으로 한다. 시스템 기본 Node가 다른 버전이어도 pnpm 10은 `pnpm-workspace.yaml`의 `useNodeVersion`을 읽어 프로젝트 스크립트를 Node 24.19.0으로 실행한다. 최초 실행에는 해당 runtime 다운로드가 발생할 수 있다.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm verify
pnpm storybook
pnpm test:e2e:container
```

## 임시 외부 공유

- Cloudflare Pages: [spp-ui-frontend.pages.dev](https://spp-ui-frontend.pages.dev/)
- 컴포넌트 검증 페이지: [spp-ui-frontend.pages.dev/components](https://spp-ui-frontend.pages.dev/components)
- `main`의 `CI`가 성공하면 `.github/workflows/cloudflare-pages.yml`이 검증된 revision을 production에 자동 배포한다.

Cloudflare 배포 자격 증명은 GitHub Actions repository secret으로만 관리한다. 현재 임시 배포 토큰은 2026-12-03에 만료되므로 외부 공유를 계속할 경우 만료 전에 교체한다.

Vite는 대표 실행 host이며 `src/ui`는 Vite runtime API를 사용하지 않는다. 기본 서체를 바꿀 때는 component CSS 대신 다음 reference input을 override한다.

실행 후 `/`는 Theme·form·overlay의 대표 제품 흐름을, `/components`는 13개 공개 컴포넌트의 variant·size·상태·상호작용을 비교하는 검증 페이지를 제공한다. 새 컴포넌트 세로 슬라이스는 `/components` inventory와 실제 상호작용 E2E를 같은 변경에서 추가한다.

```css
:root {
  --app-font-brand: 'Your Brand Font', sans-serif;
  --app-font-plain: 'Your UI Font', sans-serif;
}
```

`pnpm test:e2e:container`는 CI와 같은 브라우저 실행 환경이 필요할 때 쓰는 선택적 도구다. Linux 전용 screenshot baseline은 제품 완료 기준과 GitHub Actions blocking gate에서 제외했으며, CI는 quality와 Chromium/Firefox/WebKit 실제 흐름을 검증한다. 시각 변경은 지원 대상 환경에서 수동 검토하고 필요할 때 별도 증거를 남긴다.

## 문서 사용 순서

전체 분류와 문서 역할은 [docs/README.md](docs/README.md), 현재 운영 상태는
[PROJECT_MEMORY.md](PROJECT_MEMORY.md)에서 먼저 확인한다.

1. [M3 Web 준수 정책](docs/00-governance/00-M3-WEB-COMPLIANCE.md)에서 권위와 병합 게이트를 확인한다.
2. [Material Web 문서 적용 지도](docs/04-reference/01-MATERIAL-WEB-DOC-MAP.md)에서 구현 대상과 공식 문서를 연결한다.
3. [목표와 아키텍처 결정](docs/01-product/02-GOALS-AND-DECISIONS.md)에서 범위와 ADR을 확정한다.
4. [아키텍처와 프로젝트 설정](docs/02-architecture/03-ARCHITECTURE-AND-SETUP.md)에 따라 프로젝트 구조와 Provider를 배치한다.
5. [토큰과 동적 Theme](docs/02-architecture/04-TOKENS-AND-DYNAMIC-THEME.md)에 따라 토큰과 Theme Runtime을 먼저 구현한다.
6. [컴포넌트와 인터랙션 계약](docs/02-architecture/05-COMPONENTS-AND-INTERACTIONS.md)에 따라 공통 interaction과 13개 공개 컴포넌트를 구현한다.
7. [구현 순서와 검증 계획](docs/03-delivery/06-IMPLEMENTATION-AND-VALIDATION.md)의 순서와 검증 게이트를 따른다.
8. AI 작업은 [바이브코딩 플레이북](docs/03-delivery/07-VIBE-CODING-PLAYBOOK.md)의 프롬프트와 증거 형식을 사용한다.
9. [공식 출처와 Baseline](docs/04-reference/SOURCES.md)의 라이브 문서와 스냅샷 기준을 릴리스 전에 재검토한다.

## 구현 시작 전 체크리스트

- [x] 문서 세트를 `docs/`의 governance/product/architecture/delivery/reference로 분류했다.
- [x] `main` 문서와 v2.5.0 스냅샷의 기준일을 기록했다.
- [x] 프로젝트 메모리, 문서 인덱스, `src/ui` 기반 경계를 만들었다.
- [x] Vite를 대표 앱 호스트로, Node 24/pnpm 10.33을 지원 기준으로 확정했다.
- [x] `src/ui` 외부의 Base UI 직접 import를 금지했다.
- [x] CSS layer 순서와 전역 적용 위치를 연결했다.
- [x] Theme와 Snackbar Provider를 애플리케이션 진입점에 한 번만 배치했다.
- [x] 13개 공개 컴포넌트의 구현 상태와 남은 준수 blocker를 manifest에 기록했다.
- [ ] 미확인 또는 충돌 항목을 `M3_WEB_SPEC_CONFLICT`로 보고할 경로를 만들었다.

## 완료의 의미

문서 작성이나 Storybook 렌더링만으로 완료되지 않는다. 대표 사용자가 애플리케이션의 실제 진입점에서 13개 공개 컴포넌트를 사용하고, Theme 변경이 Portal을 포함한 전체 UI에 적용되며, 키보드·포커스·state layer·ripple·reduced motion이 의도한 흐름에서 동작해야 한다. 모든 컴포넌트의 준수 기록은 `PASS`여야 한다.
