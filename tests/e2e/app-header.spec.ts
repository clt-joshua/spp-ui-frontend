import { expect, test } from '@playwright/test';

test('세 화면은 같은 헤더에서 이동하고 현재 페이지·테마를 표시한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '라이트', exact: true }).click();
  await page.getByRole('button', { name: '테마 적용', exact: true }).click();
  let sharedClass = '';
  for (const [label, path] of [['업무용 그리드', '/grid'], ['컴포넌트 검증', '/components'], ['Theme Lab', '/']] as const) {
    const header = page.getByRole('banner');
    await header.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(header).toHaveCount(1);
    await expect(header.getByRole('navigation', { name: '주요 페이지' }).getByRole('link')).toHaveCount(3);
    await expect(header.locator('[aria-current="page"]')).toHaveText(label);
    await expect(header).toContainText('Light · Standard');
    const className = await header.getAttribute('class');
    if (sharedClass) expect(className).toBe(sharedClass);
    sharedClass = className!;
    await expect(header).toHaveCSS('height', '72px');
    await expect(header).toHaveCSS('position', 'sticky');
  }
  await page.getByRole('banner').getByRole('link', { name: '업무용 그리드', exact: true }).click();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const header = page.getByRole('banner');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const boxes = await header.getByRole('navigation').getByRole('link').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
    }));
    expect(boxes.every(box => box.left >= 0 && box.right <= width)).toBe(true);
    expect(boxes.every((box, index) => {
      const previous = boxes[index - 1];
      return !previous || box.left >= previous.right || box.top >= previous.bottom;
    })).toBe(true);
  }
  const home = page.getByRole('banner').getByRole('link', { name: 'Theme Lab', exact: true });
  await home.focus();
  await expect(home).toHaveCSS('outline-width', '3px');
  await home.press('Enter');
  await expect(page).toHaveURL(/\/$/);
});
