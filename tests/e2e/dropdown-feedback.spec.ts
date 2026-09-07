import { expect, test, type Locator, type Page } from '@playwright/test';

const themes = [
  { mode: '라이트', high: false, reduce: false },
  { mode: '다크', high: false, reduce: false },
  { mode: '라이트', high: true, reduce: true },
  { mode: '다크', high: true, reduce: true },
] as const;

async function setTheme(page: Page, theme: typeof themes[number]) {
  await page.emulateMedia({ reducedMotion: theme.reduce ? 'reduce' : 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: theme.mode, exact: true }).click();
  await page.getByRole('checkbox', { name: '고대비 색상', exact: true }).setChecked(theme.high);
}

async function quietRing(item: Locator, visible: boolean) {
  const ring = item.locator('[data-slot="focus-ring"]');
  await expect(ring).toHaveCSS('opacity', visible ? '1' : '0');
  await expect(ring).toHaveCSS('animation-name', 'none');
  await expect(ring).toHaveCSS('border-width', '3px');
  if (visible) {
    const colors = await item.evaluate((element) => ({
      text: getComputedStyle(element).color,
      ring: getComputedStyle(element.querySelector('[data-slot="focus-ring"]')!).borderColor,
    }));
    expect(colors.ring).toBe(colors.text);
  }
}

async function hoverWash(item: Locator, exactFigma: boolean) {
  // Move within the row as a pointer does, rather than teleporting onto a row
  // while Base UI is still enabling pointer navigation after popup mount.
  await item.hover({ position: { x: 8, y: 8 } });
  await item.hover({ position: { x: 12, y: 12 } });
  await quietRing(item, false);
  const layer = item.locator('[data-slot="state-layer"]');
  await expect(layer).toHaveCSS('opacity', '1');
  if (exactFigma) await expect(layer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(layer).toHaveCSS('transition-duration', '0.015s, 0.015s');
}

for (const theme of themes) {
  const label = `${theme.mode}/${theme.high ? 'High' : 'Standard'}/${theme.reduce ? 'reduce' : 'motion'}`;

  test(`Select pointer wash and static keyboard focus: ${label}`, async ({ page }) => {
    await setTheme(page, theme);
    const trigger = page.getByRole('combobox', { name: '대상 플랫폼', exact: true });
    await trigger.click();
    const current = page.getByRole('option', { name: 'Web application', exact: true });
    await expect(current).toBeFocused();
    await quietRing(current, false);
    const desktop = page.getByRole('option', { name: 'Desktop application', exact: true });
    await hoverWash(desktop, theme.mode === '라이트' && !theme.high);
    await page.keyboard.press('ArrowDown');
    // Base UI ignores WebKit zero-delta hover events, so ArrowDown can begin
    // from the current value instead of the pointer row. Both must show focus.
    await quietRing(page.locator('[role="option"]:focus'), true);
    await page.keyboard.press('End');
    const mobile = page.getByRole('option', { name: 'Mobile application', exact: true });
    await expect(mobile).toBeFocused();
    await quietRing(mobile, true);
    // The pointer is still over Desktop after keyboard navigation. Move it
    // through another row so this is real pointer input in every browser.
    await current.hover();
    await hoverWash(desktop, theme.mode === '라이트' && !theme.high);
    await quietRing(mobile, false);
    await page.keyboard.press('End');
    await expect(mobile).toBeFocused();
    await quietRing(mobile, true);
    await page.keyboard.press('Enter');
    await expect(trigger).toContainText('Mobile application');
    await expect(trigger).toBeFocused();
  });

  test(`Menu hover has no focus pulse or selected accent: ${label}`, async ({ page }) => {
    await setTheme(page, theme);
    const trigger = page.getByRole('button', { name: 'Theme Lab 메뉴', exact: true });
    await trigger.click();
    // This feedback/selection test operates on the opened menu, not on a
    // partial opening frame. Observe readiness rather than sleeping 500ms.
    await expect(page.getByRole('menu', { name: 'Theme Lab 메뉴', exact: true }))
      .not.toHaveAttribute('data-menu-motion-phase', /positioning|opening/);
    const compact = page.getByRole('menuitemcheckbox', { name: '컴팩트 미리보기', exact: true });
    await hoverWash(compact, theme.mode === '라이트' && !theme.high);
    // Read the held ripple through the real pointer flow; precomposited alpha
    // must not be multiplied by the global ripple opacity a second time.
    await page.mouse.down();
    const rippleSurface = compact.locator('[data-slot="ripple"] > span > span').last();
    await expect(rippleSurface).toHaveCSS('opacity', '1');
    if (theme.mode === '라이트' && !theme.high) {
      await expect(rippleSurface).toHaveCSS('background-image', /rgba\(0, 0, 0, 0\.16\)/);
    }
    await page.mouse.up();
    if (!(await compact.isVisible())) await trigger.click();
    await expect(compact).toHaveAttribute('aria-checked', 'true');
    await compact.hover();
    await expect(compact.locator('[data-slot="state-layer"]')).toHaveCSS('opacity', '0');
    if (theme.mode === '라이트' && !theme.high) await expect(compact).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
    await page.keyboard.press('Escape');
    await trigger.press('ArrowDown');
    await expect(compact).toBeFocused();
    await quietRing(compact, true);
    await page.keyboard.press('End');
    const help = page.getByRole('menuitem', { name: '도움말', exact: true });
    await expect(help).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const guide = page.getByRole('menuitem', { name: '토큰 가이드', exact: true });
    await expect(guide).toBeFocused();
    await quietRing(guide, true);
    await page.keyboard.press('ArrowLeft');
    await expect(help).toBeFocused();
    // Finish the submenu's 150ms exit before Escape targets the parent menu.
    await expect(guide).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });

  test(`AutoComplete distinguishes pointer highlight from virtual keyboard focus: ${label}`, async ({ page }) => {
    await setTheme(page, theme);
    await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
    const input = page.getByRole('combobox', { name: '도시 자동완성', exact: true });
    await input.fill('Se');
    const seoul = page.getByRole('option', { name: 'Seoul 서울', exact: true });
    const sejong = page.getByRole('option', { name: 'Sejong 세종', exact: true });
    await hoverWash(seoul, theme.mode === '라이트' && !theme.high);
    await expect(input).toBeFocused();
    const seoulId = await seoul.getAttribute('id') as string;
    const sejongId = await sejong.getAttribute('id') as string;
    const wasSeoulActive = await input.getAttribute('aria-activedescendant') === seoulId;
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', wasSeoulActive ? sejongId : seoulId);
    await quietRing(wasSeoulActive ? sejong : seoul, true);
    if (!wasSeoulActive) await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', sejongId);
    await quietRing(sejong, true);
    await sejong.hover();
    await hoverWash(seoul, theme.mode === '라이트' && !theme.high);
    await quietRing(seoul, false);
    await quietRing(sejong, false);
    await seoul.click();
    await expect(input).toHaveValue('Seoul 서울');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  });
}
