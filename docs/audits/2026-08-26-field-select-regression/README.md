# Field/Select 실제 화면 회귀 수정

관찰일: 2026-08-26  
대상: 실제 Vite Theme Lab (`http://localhost:5173/`)  
환경: Windows in-app Browser, Dark/Standard, `prefers-reduced-motion: reduce`

## 결론

사용자 첨부 화면의 두 현상을 재현하고 수정했다. 이전 검증은 token 값과 animation timing만 확인했기 때문에 실제 notch gap과 animation 완료 후 option visibility를 놓쳤다. 이번에는 실제 좌표, computed opacity와 popup placement를 완료 조건으로 추가했다.

## 해결된 권위 역전

`AUTHORITY INVERSION — RESOLVED`

- 상위 권위: Material Web Select는 field의 `end-start`와 menu의 `start-start`를 연결해 menu를 field 아래에 연다.
- 이전 동작: Base UI 기본 `alignItemWithTrigger`가 선택 option을 field 위에 겹쳤고, custom WAAPI가 재초기화되면서 option opacity가 `0`에 머물렀다.
- 수정: `alignItemWithTrigger={false}`로 Material Web bottom-start 흐름을 복원했다.

## 검토 단계

1. **Outlined label — 수정 완료.** `fieldset/legend`에서는 focus 3px border의 브라우저 layout 영향으로 HEX label의 실제 gap이 좌 3px·우 5px였다. start/notch/end panel로 교체한 뒤 실제 4px·4px를 확인했다.
2. **Select opening — 수정 완료.** 이전 popup은 field를 덮은 채 option opacity가 600ms 후에도 `0/0/0`이었다. 수정 후 field 아래 `data-side="bottom"`에 배치되고 opacity가 `0.817/0.483/0.150`에서 `1/1/1`로 진행한다.
3. **완료 상태 — 양호.** Select trigger와 outline은 모두 56px이며 popup은 option 3개가 즉시 식별 가능한 160px surface로 열린다.

## 화면 증거

- [수정 전 전체 화면](01-before.jpg)
- [수정 전 빈 Select popup](02-select-before.jpg)
- [수정 후 Select popup](03-select-after.jpg)
- [수정 후 field](04-field-after.jpg)
- [수정 후 HEX notch](05-hex-after.jpg)

## 검증 기준

- outline notch의 측정 label 좌우 gap이 각각 정확히 4px다.
- Select popup surface는 `data-side="bottom"`이며 field bottom보다 아래에 있다.
- 모든 option은 열림 완료 후 computed opacity `1`이다.
- motion duration/delay 객체만 존재하는 상태를 PASS로 취급하지 않는다.

## 검증 한계

스크린샷만으로 screen reader와 forced-colors 동작은 판정하지 않았다. 해당 항목은 기존 준수 게이트로 남아 있다.
