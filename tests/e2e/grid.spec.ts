import { expect, test } from '@playwright/test';

test('홈에서 그리드로 진입해 수정된 Figma 높이와 그룹 헤더를 확인한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '업무용 그리드', exact: true }).click();
  await expect(page).toHaveURL(/\/grid$/);
  const table = page.getByRole('table', { name: '업무 요청 목록', exact: true });
  await expect(table.locator('thead tr')).toHaveCount(2);
  await expect(table.getByRole('columnheader', { name: '요청 상세', exact: true })).toHaveAttribute('colspan', '2');
  await expect(table.locator('thead tr').first()).toHaveCSS('height', '32px');
  await expect(table.locator('thead tr').last()).toHaveCSS('height', '32px');
  await expect(table.locator('tbody tr').first()).toHaveCSS('height', '40px');
  await expect(table.locator('tbody td').nth(2)).toHaveCSS('font-size', '12px');
  await expect(table.locator('thead th').first()).toHaveCSS('font-weight', '600');
  await expect(table.locator('thead').getByText('*', { exact: true })).toHaveCSS('font-size', '14px');
  await expect(table.locator('tr[data-row-id="REQ-001"] [data-slot="text-field-control"]').first()).toHaveCSS('height', '32px');
  const boxes = await table.locator('thead button').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; }));
  expect(boxes.every(box => box.width === 24 && box.height === 24)).toBe(true);
  expect(boxes.every((box, i) => boxes.every((other, j) => i === j || box.right <= other.x || other.right <= box.x || box.bottom <= other.y || other.bottom <= box.y))).toBe(true);
});

test('필터된 전체 선택은 표시된 행만 바꾸고 정렬·편집 후 행 ID를 보존한다', async ({ page }) => {
  await page.goto('/grid');
  await page.getByRole('checkbox', { name: 'REQ-002 행 선택', exact: true }).check();
  await page.getByRole('button', { name: '업무명 필터 열기', exact: true }).click();
  await page.getByRole('textbox', { name: '업무명 필터', exact: true }).fill('디자인');
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tbody tr')).toHaveCount(1);
  const all = page.getByRole('checkbox', { name: '조회된 행 전체 선택', exact: true });
  await all.check();
  await expect(all).toBeChecked();
  expect(await all.evaluate(element => (element as HTMLInputElement).indeterminate)).toBe(false);
  await expect(page.locator('[data-grid]').filter({ has: page.getByRole('table', { name: '업무 요청 목록', exact: true }) }).getByLabel('선택한 행 수')).toHaveText('2개 선택');
  await page.getByRole('button', { name: '필터 지우기', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'REQ-002 행 선택', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'REQ-003 행 선택', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: '필터 닫기', exact: true }).click();
  await expect(page.getByRole('button', { name: '업무명 필터 열기', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '금액 (원) 정렬', exact: true }).click();
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tbody tr').first()).toHaveAttribute('data-row-id', 'REQ-005');
  await page.getByRole('textbox', { name: 'REQ-002 담당자', exact: true }).fill('변경 담당자');
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tr[data-row-id="REQ-002"]').getByRole('textbox')).toHaveValue('변경 담당자');
  await expect(page.getByRole('checkbox', { name: 'REQ-002 행 선택', exact: true })).toBeChecked();
});

test('셀 입력·드롭다운·총계·비활성 상태가 실제 목록에 반영된다', async ({ page }) => {
  await page.goto('/grid');
  await page.getByRole('spinbutton', { name: 'REQ-001 수량', exact: true }).fill('10');
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tfoot [data-cell-type="grand-total-number"]').first()).toHaveText('22');
  await page.getByRole('combobox', { name: 'REQ-001 분류', exact: true }).click();
  await page.getByRole('option', { name: '운영', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'REQ-001 분류', exact: true })).toHaveText(/운영/);
  await expect(page.getByRole('combobox', { name: 'REQ-001 분류', exact: true })).toBeFocused();
  await expect(page.getByRole('checkbox', { name: 'REQ-005 행 선택', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'REQ-005 담당자', exact: true })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'REQ-005 분류', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '업무명 필터 열기', exact: true }).click();
  await page.getByRole('textbox', { name: '업무명 필터', exact: true }).fill('결과없음');
  await expect(page.getByText('조회 결과가 없습니다.', { exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tfoot [data-cell-type="grand-total-number"]').first()).toHaveText('0');
});

test('타입 확인 화면에서 단일 선택과 비활성 시각 예시를 제공한다', async ({ page }) => {
  await page.goto('/grid');
  await page.getByRole('link', { name: '그리드 컴포넌트 검증', exact: true }).click();
  const table = page.getByRole('table', { name: '그리드 시각 타입', exact: true });
  await table.getByRole('radio', { name: 'GUIDE-001 행 선택', exact: true }).check();
  await table.getByRole('radio', { name: 'GUIDE-002 행 선택', exact: true }).check();
  await expect(table.getByRole('radio', { name: 'GUIDE-001 행 선택', exact: true })).not.toBeChecked();
  await expect(table.getByRole('radio', { name: 'GUIDE-002 행 선택', exact: true })).toBeChecked();
  await expect(table.getByRole('button', { name: 'Label', exact: true })).toHaveCount(0);
  await expect(table.getByRole('combobox')).toHaveCount(0);
  await expect(table.getByRole('radio', { name: 'GUIDE-003 행 선택', exact: true })).toBeDisabled();
});

test('셀 방향키·색상 모드·작은 화면에서 목록 흐름을 유지한다', async ({ page }) => {
  await page.goto('/grid');
  const first = page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tbody tr').first().locator('td').nth(2);
  await first.getByText('디자인 시스템 검토', { exact: true }).click();
  await expect(first).toBeFocused();
  await first.press('ArrowDown');
  await expect(page.getByRole('table', { name: '업무 요청 목록', exact: true }).locator('tbody tr').nth(1).locator('td').nth(2)).toBeFocused();
  const oldColor = await page.locator('thead th').first().evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: '테마 전환', exact: true }).click();
  await expect.poll(() => page.locator('thead th').first().evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(oldColor);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const region = page.getByRole('region', { name: '업무 요청 목록 스크롤 영역' });
  expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('개발 가이드의 줄바꿈·중첩 패딩·셀 타입을 실제 화면에서 재현한다', async ({ page }) => {
  await page.goto('/grid');
  await page.evaluate(() => document.fonts.ready);
  const guide = page.getByRole('table', { name: '그리드 시각 타입', exact: true });
  await expect(guide.locator('thead tr')).toHaveCSS('height', '64px');
  await expect(guide.locator('tbody tr').nth(0)).toHaveCSS('height', '40px');
  await expect(guide.locator('tbody tr').nth(1)).toHaveCSS('height', '72px');
  await expect(guide.locator('tbody tr').nth(2)).toHaveCSS('height', '40px');
  await expect(guide.locator('tbody tr').first().locator('td').first()).toHaveCSS('width', '40px');
  for (const type of ['text', 'number', 'text-edit-search', 'number-edit-search']) {
    await expect(guide.locator(`tbody tr:first-child [data-cell-type="${type}"]`)).toHaveCSS('width', '320px');
  }
  const search = guide.locator('tbody tr:first-child [data-cell-type="text-edit-search"]');
  await expect(search.locator('[data-slot="text-field-control"]')).toHaveCSS('width', '278px');
  await expect(search.locator('[data-slot="text-field-control"]')).toHaveCSS('height', '32px');
  const numeric = guide.getByRole('spinbutton', { name: 'GUIDE-001 Number edit search', exact: true });
  await expect(numeric).toHaveCSS('text-align', 'end');
  await expect(numeric).toHaveAttribute('placeholder', 'Label');
  await guide.getByRole('textbox', { name: 'GUIDE-001 Text edit search', exact: true }).fill('새 검색어');
  await expect(guide.getByRole('textbox', { name: 'GUIDE-001 Text edit search', exact: true })).toHaveValue('새 검색어');
  await expect(guide.getByRole('button', { name: /검색 실행/ })).toHaveCount(0);
  const main = page.getByRole('table', { name: '업무 요청 목록', exact: true });
  await expect(main.locator('tbody tr:first-child [data-cell-type="check-only"]')).toHaveCSS('width', '40px');
  await expect(main.locator('tbody tr:first-child [data-cell-type="no"]')).toHaveCSS('width', '48px');
  await expect(main.locator('tbody tr:first-child [data-cell-type="text-edit"] [data-slot="text-field-control"]')).toHaveCSS('width', '164px');
  const chip = main.locator('tbody tr:first-child [data-cell-type="chip"]');
  await expect(chip.getByRole('combobox')).toHaveCount(0);
  await expect(chip.locator('span').last()).toHaveCSS('height', '20px');
  await expect(main.locator('[data-cell-type="check-button"]')).toHaveCount(0);
});

test('헤더 포인터·키보드 피드백은 셀에 한 번만 그려진다', async ({ page }) => {
  await page.goto('/grid');
  const sort = page.getByRole('button', { name: '업무명 정렬', exact: true });
  await sort.hover();
  const header = sort.locator('xpath=ancestor::th');
  const headerLayer = () => header.evaluate(e => ({ color: getComputedStyle(e, '::before').backgroundColor, opacity: getComputedStyle(e, '::before').opacity }));
  expect(await headerLayer()).toEqual({ color: 'rgba(0, 0, 0, 0.06)', opacity: '1' });
  await expect(sort.locator('[data-slot="state-layer"]')).toHaveCSS('opacity', '0');
  await sort.click();
  await sort.press('Tab');
  const filter = page.getByRole('button', { name: '업무명 필터 열기', exact: true });
  await expect(filter).toBeFocused();
  expect(await headerLayer()).toEqual({ color: 'rgba(0, 0, 0, 0.12)', opacity: '1' });
  await expect(filter.locator('[data-slot="state-layer"]')).toHaveCSS('opacity', '0');
});
