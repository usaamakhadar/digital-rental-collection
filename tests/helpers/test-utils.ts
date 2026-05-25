import { Page, expect } from '@playwright/test';

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  // Choose Somali or English language
  const somButton = page.locator('button:has-text("SOM")');
  await expect(somButton).toBeVisible();
  
  // Fill email and password (scoped to the login form)
  const loginForm = page.locator('form');
  await loginForm.locator('input[name="email"]').fill(email);
  await loginForm.locator('input[name="password"]').fill(password);
  
  // Submit form
  await loginForm.locator('button[type="submit"]').click();
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
}

export async function createTestProperty(page: Page, name: string) {
  // Go to Guryaha or click Add Property
  const addPropButton = page.locator('button:has-text("Ku dar Guri")');
  await expect(addPropButton).toBeVisible();
  await addPropButton.click();
  
  // Scope selector to the form inside the property modal (to avoid strict mode conflicts with dashboard tenant form)
  const propForm = page.locator('form:has-text("Magaca Guriga/Dhismaha")');
  await propForm.locator('input[name="name"]').fill(name);
  await propForm.locator('input[name="address"]').fill('Test Address, Hargeisa');
  
  // Save
  await propForm.locator('button[type="submit"]').click();
  
  // Wait for modal to close
  await expect(page.locator('text=Keydi Guriga')).toBeHidden({ timeout: 10000 });
}

export async function createTestUnit(page: Page, propertyName: string, unitNumber: string, rentAmount: string) {
  // Click Add Unit
  const addUnitButton = page.locator('button:has-text("Ku dar Qol")');
  await expect(addUnitButton).toBeVisible();
  await addUnitButton.click();
  
  // Select property in unit modal
  const unitForm = page.locator('form:has-text("Dooro Guriga")');
  await unitForm.locator('select[name="propertyId"]').selectOption({ label: propertyName });
  
  // Fill unit details
  await unitForm.locator('input[name="unitNumber"]').fill(unitNumber);
  await unitForm.locator('input[name="rentAmount"]').fill(rentAmount);
  
  // Save
  await unitForm.locator('button[type="submit"]').click();
  
  // Wait for modal to close
  await expect(page.locator('text=Keydi Qolka')).toBeHidden({ timeout: 10000 });
}
