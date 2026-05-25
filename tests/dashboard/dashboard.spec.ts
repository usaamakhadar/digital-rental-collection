import { test, expect } from '@playwright/test';
import { loginUser, createTestProperty, createTestUnit } from '../helpers/test-utils';

test.describe('Dashboard Statistics', () => {
  test('Dashboard stat cards update correctly when a new unit is created', async ({ page }) => {
    // Log in
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    // Get current total units count from the dashboard stat card case-insensitively
    const statCard = page.locator('div').filter({ hasText: /Qolalka Guud/i }).first();
    const initialText = await statCard.locator('h3, .text-2xl').first().innerText();
    const initialCount = parseInt(initialText.replace(/\D/g, ''), 10) || 0;

    const timestamp = Date.now();
    const propertyName = `PropDash ${timestamp}`;
    const unitNumber = `UnitDash ${timestamp}`;

    // Create a new property and unit
    await createTestProperty(page, propertyName);
    await createTestUnit(page, propertyName, unitNumber, '300');

    // Go back to dashboard if not already there
    await page.locator('button:has-text("Dashboard")').click();

    // Verify the "Qolalka Guud" count increased by 1 using Playwright's automatic polling assertion
    const expectedText = new RegExp(`\\b${initialCount + 1}\\b`);
    await expect(statCard.locator('h3, .text-2xl').first()).toHaveText(expectedText, { timeout: 15000 });
  });
});
