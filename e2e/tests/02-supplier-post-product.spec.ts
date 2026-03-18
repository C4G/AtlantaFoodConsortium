/**
 * Test 02 — Supplier posts a product request
 *
 * Steps:
 *   1. Supplier navigates to /supplier dashboard
 *   2. Opens the "My Products" tab
 *   3. Fills the product form
 *   4. Submits — POST /api/product-requests/multiple is called
 *   5. Product-availability emails are called per product
 *   6. Product appears in the pickup-request table with status AVAILABLE
 */

import { test, expect } from '@playwright/test';
import { TEST_PRODUCT_NAME, writeState } from '../shared-state';

test.use({ storageState: 'e2e/.auth/supplier.json' });
test.describe.configure({ mode: 'serial' });

// product ID from the API response so downstream tests can use it
let capturedProductId: string | undefined;

test('supplier is redirected to /supplier dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/supplier', { timeout: 10_000 });
  await expect(page.getByText('MAFC')).toBeVisible();
});

test('supplier fills the product form and submits', async ({ page }) => {
  await page.route('**/api/product-requests/multiple', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    if (Array.isArray(body) && body.length > 0) {
      capturedProductId = body[0].id as string;
    }
    await route.fulfill({ response });
  });

  // Mocked availability emails
  await page.route('**/api/product-availability-emails', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/supplier');

  // Switch tabs
  await page.getByRole('button', { name: /my products/i }).click();

  // form stuff
  await page.getByLabel('Produce').check();

  await page
    .locator(`input[name="productDetails.PRODUCE.name"]`)
    .fill(TEST_PRODUCT_NAME);

  await page
    .locator(`textarea[name="productDetails.PRODUCE.description"]`)
    .fill('Fresh seasonal vegetables for E2E automated testing.');

  await page
    .locator(`input[name="productDetails.PRODUCE.specifics"]`)
    .fill('Mixed seasonal greens');

  await page
    .locator(`select[name="productDetails.PRODUCE.units"]`)
    .selectOption('POUNDS');

  await page
    .locator(`input[name="productDetails.PRODUCE.quantity"]`)
    .fill('100');

  // pickup date stuff
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  const dateStr = futureDate.toISOString().split('T')[0];

  await page.locator('input[name="pickupDate"]').fill(dateStr);

  await page.getByLabel('7 AM - 10 AM').check();

  await page
    .locator('input[name="pickupLocation"]')
    .fill('123 E2E Test Street, Atlanta, GA 30301');

  // Contact
  await page
    .locator('input[name="mainContactName"]')
    .fill('E2E Contact Person');
  await page.locator('input[name="mainContactNumber"]').fill('4045559999');

  // Instructions
  await page
    .locator('textarea[name="instructions"]')
    .fill('Ring the buzzer at the back entrance.');

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({
    timeout: 12_000,
  });

  await expect(
    page.getByRole('row').filter({ hasText: TEST_PRODUCT_NAME })
  ).toContainText('AVAILABLE');
});

test('product ID is captured and saved to shared state', async () => {
  // Persisting the captured ID here for the nex test in the line
  expect(capturedProductId).toBeTruthy();

  if (capturedProductId) {
    writeState({ postedProductId: capturedProductId });
    console.log(`Captured product ID: ${capturedProductId}`);
  }
});
