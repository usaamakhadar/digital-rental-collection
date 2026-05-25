import { test, expect } from '@playwright/test';
import { loginUser } from '../helpers/test-utils';

test.describe('User Settings Management', () => {
  test('User can edit their company profile/settings', async ({ page }) => {
    // Log in
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    // Click Settings in sidebar
    const settingsTab = page.locator('button:has-text("Settings")');
    await expect(settingsTab).toBeVisible();
    await settingsTab.click();

    // Fill settings form
    const randomSuffix = Math.floor(Math.random() * 1000);
    const newBusinessName = `Subeer Real Estate ${randomSuffix}`;
    const newPhone = `+25263777555${Math.floor(Math.random() * 10)}`;

    await page.locator('input[name="businessName"]').fill(newBusinessName);
    await page.locator('input[name="phone"]').fill(newPhone);

    // Catch the window alert or check success state
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('si guul leh');
      await dialog.accept();
    });

    // Save changes
    await page.locator('button:has-text("Keydi Isbeddelada")').click();

    // Check that the company name in the top right header is updated
    await expect(page.locator(`text=${newBusinessName}`).first()).toBeVisible({ timeout: 10000 });
  });
});
