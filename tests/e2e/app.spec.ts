import { expect, test } from '@playwright/test';

test('zeigt den Spieltitel auf der Startseite', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('main')).toContainText('PPPoppi 1986');
});


test('verwendet genau einen Hauptbereich und einen wirksamen Sprunglink', async ({ page }) => {
  await page.goto('/');

  const main = page.getByRole('main');
  const skipLink = page.getByRole('link', { name: 'Zum Spielbereich springen' });

  await expect(main).toHaveCount(1);
  await expect(main).toHaveAttribute('id', 'main-content');
  await expect(skipLink).toHaveAttribute('href', '#main-content');
  await skipLink.click();
  await expect(page).toHaveURL(/#main-content$/);
});
