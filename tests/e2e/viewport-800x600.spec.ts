import { expect, test } from '@playwright/test';

test('zeigt die Startansicht bei 800 × 600 ohne unnötigen Seitenlauf', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /PPPoppi 1986/ })).toBeVisible();

  const layout = await page.evaluate(() => {
    const shell = document.querySelector('.shell');
    if (!(shell instanceof HTMLElement)) {
      throw new Error('Spielbereich .shell fehlt.');
    }

    return {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      shellBottom: shell.getBoundingClientRect().bottom,
      boxSizing: getComputedStyle(shell).boxSizing,
    };
  });

  expect(layout.boxSizing).toBe('border-box');
  expect(layout.scrollWidth).toBeLessThanOrEqual(800);
  expect(layout.scrollHeight).toBeLessThanOrEqual(600);
  expect(layout.shellBottom).toBeLessThanOrEqual(600);
});
