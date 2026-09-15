# TextField 라벨 이동 경로·복귀 잔상 수정

## 원인과 수정

- `localhost:5174`의 실제 상단 검증 진입 → TextField → large/small empty 필드에서 focus/blur를 재현했다.
- 기존 width-ratio scale은 작은 floating font를 resting typography로 근사할 뿐이었다. large 예제에서는 움직이는 라벨의 최종 top이 정지 라벨보다 1px 아래였고, 150ms 종료 후 원래 라벨로 바뀌며 역방향 위치/글꼴 변화가 생겼다.
- 복귀 중 placeholder/affix opacity는 16ms 약 0.62, 32ms 약 0.21로 남아 내려오는 라벨과 겹쳤다. 단순히 라벨 두 개의 opacity 합만 검사하던 기존 회귀는 이 중첩과 최종 위치의 방향 반전을 검출하지 못했다.
- 실제 Figma endpoint font-size/line-height/tracking/weight와 좌표를 연속 보간한다. 위치 기준 wrapper 높이를 고정해 행간 변화가 기준점을 움직이지 않게 한다. 방향 반전은 현재 typography·width·transform에서 이어간다.
- 마지막 frame은 가시 라벨 인계까지 hold하고 바로 해제해 상단 위치 flash를 방지한다. 복귀 때 placeholder/affix만 즉시 감춘다. native input의 visibility, 접근 가능한 이름, focus와 Tab 진입은 유지한다.
- 색상·공간·타이포그래피·duration/easing 토큰과 최종 Figma 치수는 변경하지 않았고 신규 토큰도 없다. 150ms standard 및 진입 content 67ms delay/83ms fade는 유지한다.
- 원본 Material Web의 scale/outgoing fade와 다른 사용자 요청의 scoped 보정임을 manifest/컴포넌트 계약에 명시했다. 공통 hook의 AutoComplete에도 같은 수정이 적용된다. 기존 AT/Windows Contrast Themes 수동 BLOCKED는 유지한다.

## 출처

- [Material Web Field](https://github.com/material-components/material-web/blob/main/field/internal/field.ts): 단일 가시 라벨, 실측 keyframes, width ratio scaling, 150ms standard.
- [Material Web content](https://github.com/material-components/material-web/blob/main/field/internal/_content.scss): 진입 delay/내용 fade.
- Figma endpoint 근거는 직전 [정합성 검증](../2026-09-08-checkbox-affix-alignment/README.md)의 `10443:76122`, `10443:77310`을 유지한다. 이번 작업에서 디자인 토큰을 새로 추출/변경하지 않았다.

## 증거와 검증

- 수정 전 중간 화면 `artifacts/label-return-before.png`, 수정 후 다크 중간 화면 `artifacts/label-return-dark-midpoint.png`. 실제 앱 페이지의 라벨 전환을 정지해 glyph/placeholder 중첩 여부를 확인했다. 자동 pixel baseline 게이트로 사용하지 않는다.
- 수정 후 실제 연속 frame: large 복귀 top 차이가 -18.5 → -14.79 → -8.30 → -4.96 → -2.96 → -1.69 → -0.86 → -0.35 → -0.08px → 정지 0px로 접근한다. 전 구간 placeholder opacity 0.
- `label-return.spec.ts`: 상단 진입/컴포넌트 선택 → 실제 focus/blur, 두 크기의 직선 경로·단조 이동·최종 정지 좌표, 장식 숨김 및 native input 재진입을 검사한다.
- `field-motion.spec.ts`: 기존 방향 반전/겹치는 라벨 금지 기대값은 유지했다. 종료 후 animation이 제거되어 idle이 되는 정상 lifecycle을 관찰하도록 loop 종료 조건만 고쳤다. 첫 실행의 해당 2건 timeout은 이 관찰 loop 문제였고 제품 motion을 늦추거나 assertion을 완화하지 않았다.
- 관련 3-browser E2E 33/33 PASS(2.2분). 최종 전체 게이트는 아래 기록을 따른다.

기존 누적 변경을 보존했다. 커밋·푸시·배포 없음.

## 최종 결과

- 품질 게이트 `pnpm verify` PASS: 구조/lint/typecheck, 11 suites·50 unit, 앱 및 Storybook 빌드. 신규 테스트 타입 오류와 manifest 문구 assertion은 교정 후 전체 게이트를 재실행했다.
- `PLAYWRIGHT_PORT=4184 pnpm test:e2e`: **201/201 PASS**, Chromium·Firefox·WebKit 각각 67개, 단일 실행 12.4분, retries 0.
- 실행 중 4184 HTML과 dist의 동일성 확인: `index-CFIJ4ZXq.js` / `index-CyW1yUfM.css`. 다른 작업의 4173 서버는 보존했다. 개발 화면은 5174다.
- 색상/토큰 추가·변경 없음. 기존 수동 접근성 BLOCKED를 PASS로 승격하지 않았다.
