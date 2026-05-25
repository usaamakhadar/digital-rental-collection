import { test, expect } from '@playwright/test';
import { loginUser, createTestProperty, createTestUnit } from '../helpers/test-utils';

test.describe('Payment Management', () => {
  test('User can pay an invoice manually and verify payment history updates', async ({ page }) => {
    test.setTimeout(90000);
    // Log in
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    const timestamp = Date.now();
    const propertyName = `PropPay ${timestamp}`;
    const unitNumber = `UnitPay ${timestamp}`;
    const tenantName = `TenantPay ${timestamp}`;

    // Create Property and vacant Unit
    await createTestProperty(page, propertyName);
    await createTestUnit(page, propertyName, unitNumber, '500');

    // Create Lease
    const leaseForm = page.locator('form').filter({ has: page.locator('select[name="unitId"]') });
    await leaseForm.locator('input[name="name"]').fill(tenantName);
    await leaseForm.locator('input[name="phone"]').fill('634463028');
    await leaseForm.locator('input[name="emergencyContactName"]').fill('Damiin Test');
    await leaseForm.locator('input[name="emergencyContactPhone"]').fill('636699669');
    await leaseForm.locator('select[name="unitId"]').selectOption({ label: `${propertyName} - ${unitNumber} ($500.00)` });
    await leaseForm.locator('input[name="startDate"]').fill('2026-05-25');

    // Register a global dialog handler to automatically accept all alerts/confirms
    page.on('dialog', async dialog => {
      console.log(`[Dialog] ${dialog.message()}`);
      await dialog.accept();
    });

    await leaseForm.locator('button[type="submit"]').click();

    // Click Kiraystayaasha tab to view the full active leases list
    await page.locator('button:has-text("Kiraystayaasha")').click();

    // Verify tenant exists in Active Leases (reload if necessary due to cache)
    await expect(page.locator(`text=${tenantName}`)).toBeVisible({ timeout: 5000 }).catch(async () => {
      await page.reload();
      await page.locator('button:has-text("Kiraystayaasha")').click();
      await expect(page.locator(`text=${tenantName}`)).toBeVisible({ timeout: 10000 });
    });

    // Navigate to Invoices (Biilasha Kirada)
    const invoicesTab = page.locator('button:has-text("Biilasha Kirada")');
    await expect(invoicesTab).toBeVisible();
    await invoicesTab.click();

    // Verify the invoice is listed
    await expect(page.locator(`text=${tenantName}`)).toBeVisible();

    // Click "Bixi" on the invoice row
    const invoiceRow = page.locator(`tr:has-text("${tenantName}")`);
    await invoiceRow.locator('button:has-text("Bixi")').click();

    // Wait for Payment Modal to be visible
    await expect(page.locator('text=Diiwangkali Lacag Bixinta')).toBeVisible();

    // Fill Payment Modal
    const refId = `CASH-${timestamp}`;
    const paymentForm = page.locator('form').filter({ has: page.locator('button:has-text("Xaqiiji Lacagta")') });
    await paymentForm.locator('input[type="text"]').fill(refId);

    // Confirm Payment
    await paymentForm.locator('button:has-text("Xaqiiji Lacagta")').click();

    // Wait for Payment Modal to close
    await expect(page.locator('text=Diiwangkali Lacag Bixinta')).toBeHidden({ timeout: 15000 });

    // Verify invoice status updates to PAID / La Bixiyay (reload if necessary)
    await expect(invoiceRow.locator('text=La Bixiyay')).toBeVisible({ timeout: 5000 }).catch(async () => {
      await page.reload();
      await page.locator('button:has-text("Biilasha Kirada")').click();
      const reloadedRow = page.locator(`tr:has-text("${tenantName}")`);
      await expect(reloadedRow.locator('text=La Bixiyay')).toBeVisible({ timeout: 10000 });
    });

    // Navigate to Payments (Lacagaha)
    const paymentsTab = page.locator('button:has-text("Lacagaha")');
    await expect(paymentsTab).toBeVisible();
    await paymentsTab.click();

    // Verify the payment details in the payment history table
    await expect(page.locator(`text=${tenantName}`)).toBeVisible();
    await expect(page.locator(`text=${refId}`)).toBeVisible();
  });
});
