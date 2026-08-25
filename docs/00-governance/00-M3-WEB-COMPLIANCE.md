---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# M3 Web 준수 정책

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 권위 순서

| 순위 | 권위 | 역할 |
|---:|---|---|
| 1 | 현재 사용자 요구사항 | 제품 목표와 명시적 범위 |
| 2 | M3 for Web | Web 지원 상태와 최상위 구현 방향 |
| 3 | Material Web `docs@main` | Web 사용법·접근성·Theming·API의 라이브 기준 |
| 4 | M3 Foundations/Styles/Components/Accessibility | 디자인 의미와 컴포넌트 스펙 |
| 5 | Material Web v2.5.0 snapshot | 재현 가능한 비교 기준 |
| 6 | WAI-ARIA APG/WCAG | M3 문서가 위임하거나 침묵하는 접근성 영역 |
| 7 | Base UI 문서 | headless 구현 수단 |
| 8 | 프로젝트 코드와 테스트 | 상위 계약을 검증하는 하위 증거 |

하위 권위가 상위 권위를 재정의하면 `AUTHORITY INVERSION`이다. 해당 구현을 확장하지 말고 상위 계약을 복원한다.

## 준수 범위

모든 공개 컴포넌트에 아래 항목을 적용한다.

- anatomy와 variant
- 크기, 밀도, 최소 터치 영역
- color role과 동적 컬러 전환
- typography와 아이콘
- shape와 elevation
- enabled, disabled, hover, focus, pressed, selected, error 상태
- state layer, ripple, focus indicator
- opening/closing 및 상태 전환 motion
- 키보드, 포커스 관리, 접근 가능한 이름과 설명
- Portal, stacking, viewport 및 반응형 동작

## Stable Web와 Expressive 경계

- Stable Material Web 문서와 컴포넌트 구현을 제품 기준으로 사용한다.
- `labs/`와 문서에 없는 generated token은 제품 계약으로 승격하지 않는다.
- M3 Expressive shape morph와 spring physics는 공식 Web 구현이 없으므로 `deferred`다.
- 향후 공식 Web 지원이 추가되면 ADR, baseline 변경, visual regression 갱신을 한 변경 세트로 수행한다.
- 제품이 자체 Expressive 효과를 요구하면 M3 Web 준수 구현과 분리된 실험으로 다루며 기본값으로 노출하지 않는다.

## 충돌 처리

충돌을 발견하면 다음 형식으로 기록한다.

```text
M3_WEB_SPEC_CONFLICT
- Target: Button / pressed state
- Higher authority: <official URL and section>
- Current behavior: <observable behavior>
- Expected behavior: <spec-derived behavior>
- Affected consumers: <components/screens>
- Required action: <change or decision>
- Status: BLOCKED
```

충돌 상태에서 금지되는 행위:

- 테스트 기대값을 현재 구현에 맞춰 변경하기
- 유사해 보이는 다른 플랫폼 구현으로 대체하기
- 문서 부재를 자유 구현 허가로 해석하기
- `PARTIAL PASS` 또는 시각적으로 비슷하다는 이유로 완료 처리하기
- Material Web Labs 동작을 안정 Web 계약으로 사용하기

## `main`과 snapshot 관리

- 라이브 기준: `https://github.com/material-components/material-web/tree/main/docs`
- 재현 기준: `https://github.com/material-components/material-web/tree/b4de401eb665ec63474f39319a4ba8f2145974cc/docs`
- 릴리스 전 라이브 문서가 snapshot 이후 변경되었는지 확인한다.
- 변경이 있으면 관련 문서, token snapshot, Storybook baseline, `M3ComplianceRecord`를 함께 갱신한다.
- 변경 영향이 불분명하면 기존 snapshot을 조용히 유지하지 말고 `BLOCKED`로 기록한다.

## 컴포넌트 준수 기록

```ts
interface M3ComplianceRecord {
  component: string;
  m3WebUrl: string;
  m3ComponentUrls: string[];
  materialWebMainDocs: string[];
  materialWebSnapshotDocs: string[];
  materialWebReferenceStatus:
    | 'available'
    | 'unavailable'
    | 'not-applicable';
  verifiedAt: string;
  checkedAreas: Array<
    | 'anatomy'
    | 'usage'
    | 'api-semantics'
    | 'color'
    | 'typography'
    | 'shape'
    | 'size'
    | 'elevation'
    | 'state'
    | 'ripple'
    | 'focus'
    | 'motion'
    | 'accessibility'
  >;
  deviations: never[];
  status: 'PASS' | 'BLOCKED';
}
```

Material Web 문서가 없는 Snackbar는 `unavailable`을 기록하고 M3 Snackbar 문서와 WAI-ARIA/WCAG 근거를 제공해야 한다. 문서 부재만으로 `BLOCKED`가 되지는 않지만 대체 공식 근거가 없으면 `PASS`가 될 수 없다.

## 병합 게이트

- [ ] 라이브·snapshot 공식 URL이 기록되어 있다.
- [ ] Usage, Accessibility, Theming/API 섹션을 검토했다.
- [ ] anatomy부터 accessibility까지 적용 가능한 영역을 확인했다.
- [ ] 대표 사용자 흐름으로 실제 동작을 검증했다.
- [ ] Light/Dark/High contrast와 reduced motion을 확인했다.
- [ ] `M3_WEB_SPEC_CONFLICT`가 남아 있지 않다.
- [ ] `M3ComplianceRecord.status`가 `PASS`다.
