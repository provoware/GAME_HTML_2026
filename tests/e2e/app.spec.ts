import { expect, test } from '@playwright/test';

test('zeigt den Spieltitel auf der Startseite', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('main')).toContainText('PPPoppi 1986');
});
