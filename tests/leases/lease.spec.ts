import { test, expect } from '@playwright/test';
import { loginUser, createTestProperty, createTestUnit } from '../helpers/test-utils';

test.describe('Lease Agreement Management', () => {
  test('User can create a lease, pay the invoice, and then terminate it — verifying unit status updates', async ({ page }) => {
    test.setTimeout(120000);

    // Register a global dialog handler to automatically accept all alerts/confirms
    page.on('dialog', async dialog => {
      console.log(`[Dialog] ${dialog.message()}`);
      await dialog.accept();
    });

    // --- Step 1: Login ---
    await loginUser(page, 'muscabkhadar69@gmail.com', '123456');

    const timestamp = Date.now();
    const propertyName = `PropLease ${timestamp}`;
    const unitNumber = `UnitLease ${timestamp}`;
    const tenantName = `Tenant ${timestamp}`;

    // --- Step 2: Create Property and vacant Unit ---
    await createTestProperty(page, propertyName);
    await createTestUnit(page, propertyName, unitNumber, '400');

    // --- Step 3: Fill and submit the lease form ---
    const leaseForm = page.locator('form').filter({ has: page.locator('select[name="unitId"]') });
    await leaseForm.locator('input[name="name"]').fill(tenantName);
    await leaseForm.locator('input[name="phone"]').fill('634463028');
    await leaseForm.locator('input[name="emergencyContactName"]').fill('Damiin Test');
    await leaseForm.locator('input[name="emergencyContactPhone"]').fill('636699669');
    await leaseForm.locator('select[name="unitId"]').selectOption({ label: `${propertyName} - ${unitNumber} ($400.00)` });
    await leaseForm.locator('input[name="startDate"]').fill('2026-05-25');
    await leaseForm.locator('button[type="submit"]').click();

    // Wait for success dialog (auto-accepted by handler above)
    // Page will refresh after dialog is accepted
    await page.waitForTimeout(4000);

    // --- Step 4: Navigate to Invoices tab and pay the pending invoice ---
    // The lease creates a PENDING invoice, which must be paid before termination
    await page.locator('button:has-text("Biilasha Kirada")').click();

    // Find and click the "Bixi" (Pay) button for this tenant's invoice
    // Reload if not visible due to Next.js cache
    await expect(page.locator(`tr:has-text("${tenantName}")`).locator('button:has-text("Bixi")')).toBeVisible({ timeout: 8000 }).catch(async () => {
      await page.reload();
      await page.locator('button:has-text("Biilasha Kirada")').click();
      await expect(page.locator(`tr:has-text("${tenantName}")`).locator('button:has-text("Bixi")')).toBeVisible({ timeout: 10000 });
    });

    await page.locator(`tr:has-text("${tenantName}")`).locator('button:has-text("Bixi")').click();

    // Payment modal should open — fill it and confirm
    await expect(page.locator('text=Diiwangkali Lacag Bixinta')).toBeVisible({ timeout: 5000 });

    // Payment method is already CASH by default. Amount is pre-filled. Just confirm.
    await page.locator('button:has-text("Xaqiiji Lacagta")').click();

    // Dialog: payment success (auto-accepted). Page will refresh.
    await page.waitForTimeout(4000);

    // --- Step 5: Navigate to Kiraystayaasha tab ---
    await page.locator('button:has-text("Kiraystayaasha")').click();

    // Verify tenant is visible in Active Leases
    await expect(page.locator(`text=${tenantName}`)).toBeVisible({ timeout: 10000 }).catch(async () => {
      await page.reload();
      await page.locator('button:has-text("Kiraystayaasha")').click();
      await expect(page.locator(`text=${tenantName}`)).toBeVisible({ timeout: 10000 });
    });

    // --- Step 6: Verify unit status is OCCUPIED ---
    const propertiesTab = page.locator('button:has-text("Guryaha")');
    await propertiesTab.click();
    const unitRow = page.locator('div.flex.justify-between.items-center').filter({ hasText: unitNumber }).first();
    await expect(unitRow.locator('text=La Degan Yahay')).toBeVisible({ timeout: 8000 });

    // --- Step 7: Terminate the lease ---
    await page.locator('button:has-text("Kiraystayaasha")').click();

    // Confirm tenant is still listed
    await expect(page.locator(`text=${tenantName}`)).toBeVisible({ timeout: 8000 });

    // Click "Jooji Kiro" (Terminate) button for this tenant
    const leaseRow = page.locator(`tr:has-text("${tenantName}")`);
    await leaseRow.locator('button:has-text("Jooji Kiro")').click();

    // Confirmation dialog auto-accepted. Page refreshes.
    await page.waitForTimeout(6000);

    // --- Step 8: Verify tenant is REMOVED from active leases ---
    // Reload to ensure fresh data from server
    await expect(page.locator(`text=${tenantName}`)).toBeHidden({ timeout: 10000 }).catch(async () => {
      await page.reload();
      await page.locator('button:has-text("Kiraystayaasha")').click();
      await expect(page.locator(`text=${tenantName}`)).toBeHidden({ timeout: 15000 });
    });

    // --- Step 9: Verify unit status reverted to VACANT ---
    await propertiesTab.click();
    const unitRowVacant = page.locator('div.flex.justify-between.items-center').filter({ hasText: unitNumber }).first();
    await expect(unitRowVacant.locator('text=Bannaan')).toBeVisible({ timeout: 10000 });
  });
});
