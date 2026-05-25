import { test, expect } from '@playwright/test';
import { loginUser, createTestProperty, createTestUnit } from '../helpers/test-utils';

test.describe('Concurrency Double Booking Prevention', () => {
  test('Two concurrent users attempting to book the same vacant unit will result in exactly one success and one failure', async ({ browser }) => {
    test.setTimeout(90000);
    // 1. Setup a vacant unit using muscabkhadar69
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginUser(adminPage, 'muscabkhadar69@gmail.com', '123456');

    const timestamp = Date.now();
    const propertyName = `ConcurrencyProp ${timestamp}`;
    const unitNumber = `Apt ${timestamp}`;

    await createTestProperty(adminPage, propertyName);
    await createTestUnit(adminPage, propertyName, unitNumber, '350');

    // 2. Open two separate contexts for two different pages (authenticated as the same landlord account to see same vacant units)
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await loginUser(page1, 'muscabkhadar69@gmail.com', '123456');

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await loginUser(page2, 'muscabkhadar69@gmail.com', '123456');

    // 3. Prepare the booking form on both pages for the EXACT SAME unit
    const preparePage = async (page: any, tenantName: string) => {
      const leaseForm = page.locator('form').filter({ has: page.locator('select[name="unitId"]') });
      await leaseForm.locator('input[name="name"]').fill(tenantName);
      await leaseForm.locator('input[name="phone"]').fill('634463028');
      await leaseForm.locator('input[name="emergencyContactName"]').fill('Damiin Test');
      await leaseForm.locator('input[name="emergencyContactPhone"]').fill('636699669');
      await leaseForm.locator('select[name="unitId"]').selectOption({ label: `${propertyName} - ${unitNumber} ($350.00)` });
      await leaseForm.locator('input[name="startDate"]').fill('2026-05-25');
    };

    await preparePage(page1, 'Concurrent Tenant 1');
    await preparePage(page2, 'Concurrent Tenant 2');

    // 4. Capture dialog alerts for success
    let successMsgCount = 0;

    const handleDialog = (page: any) => {
      page.on('dialog', async (dialog: any) => {
        const text = dialog.message();
        if (text.includes('si guul leh') || text.includes('successfully')) {
          successMsgCount++;
        }
        await dialog.accept();
      });
    };

    handleDialog(page1);
    handleDialog(page2);

    // 5. Submit both booking requests simultaneously
    const btn1 = page1.locator('form').filter({ has: page1.locator('select[name="unitId"]') }).locator('button[type="submit"]');
    const btn2 = page2.locator('form').filter({ has: page2.locator('select[name="unitId"]') }).locator('button[type="submit"]');

    await Promise.all([
      btn1.click().catch(() => {}),
      btn2.click().catch(() => {})
    ]);

    // Wait a moment for page reloads/network requests to settle
    await page1.waitForTimeout(8000);
    await page2.waitForTimeout(8000);

    // 6. Assert that exactly one succeeded and the other failed/rejected!
    // Success will trigger dialog success counter
    // Failure will render an error banner on the screen (div.bg-rose-50)
    const isBanner1Visible = await page1.locator('div.p-4.bg-rose-50').isVisible();
    const isBanner2Visible = await page2.locator('div.p-4.bg-rose-50').isVisible();
    const totalBanners = (isBanner1Visible ? 1 : 0) + (isBanner2Visible ? 1 : 0);

    expect(successMsgCount).toBe(1);
    expect(totalBanners).toBe(1);

    await adminContext.close();
    await context1.close();
    await context2.close();
  });
});
