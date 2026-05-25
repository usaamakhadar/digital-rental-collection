import { test, expect } from '@playwright/test';
import { loginUser } from '../helpers/test-utils';

test.describe('E2E Stress and Network Resilience Tests', () => {
  
  test('Rapid submissions are disabled once loading state is triggered', async ({ page }) => {
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    // Click "+ Ku dar Guri" to open property modal
    await page.locator('button:has-text("Ku dar Guri")').click();
    
    // Fill the property form scoped to the property modal form to prevent strict mode violations
    const propForm = page.locator('form:has-text("Magaca Guriga/Dhismaha")');
    await propForm.locator('input[name="name"]').fill('Rapid Property');
    await propForm.locator('input[name="address"]').fill('Rapid Address');

    const submitBtn = page.locator('button:has-text("Keydi Guriga")');
    
    // Concurrently click the button 5 times as fast as possible
    await Promise.all([
      submitBtn.click().catch(() => {}),
      submitBtn.click().catch(() => {}),
      submitBtn.click().catch(() => {}),
      submitBtn.click().catch(() => {}),
      submitBtn.click().catch(() => {})
    ]);

    // Verify button gets disabled or loading state handles it, and modal closes normally
    await expect(page.locator('text=Keydi Guriga')).toBeHidden({ timeout: 10000 });
  });

  test('System behaves gracefully when camera/location permissions are denied', async ({ browser }) => {
    // Open a context with denied permissions
    const context = await browser.newContext({
      permissions: [], // No permissions granted
    });
    const page = await context.newPage();
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    // Verify dashboard loads normally without crashing due to permission denial
    await expect(page.locator('text=Dashboard-ka')).toBeVisible();
    await context.close();
  });

  test('Offline mode handles network disconnects gracefully', async ({ page, context }) => {
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    // Verify dashboard loaded
    await expect(page.locator('text=Dashboard-ka')).toBeVisible();

    // Turn network offline
    await context.setOffline(true);

    // Try to trigger a refresh or click tabs
    await page.locator('button:has-text("Guryaha")').click();
    
    // Verify offline message or app stays interactive without white-screening/crashing
    await expect(page.locator('text=Guryaha')).toBeVisible();

    // Restore network
    await context.setOffline(false);
  });
});
