/**
 * Test 03 — Nonprofit claims the product
 *
 * Pre-conditions:
 *   - Test 01 has set nonprofitDocumentApproval = true in the DB
 *   - Test 02 has posted a product with status AVAILABLE
 *
 * Steps:
 *   1. Nonprofit navigates to /nonprofit dashboard
 *   2. Opens the "Available Products" tab
 *   3. Finds the product posted by the supplier
 *   4. "Claim This Product" button is ENABLED (approval is true)
 *   5. Clicks it → confirmation modal → "Confirm Claim"
 *   6. Product disappears from Available Products list
 *   7. Navigates to "My Claims" tab → product is present
 */

import { test, expect } from '@playwright/test';
import { TEST_PRODUCT_NAME } from '../shared-state';

test.use({ storageState: 'e2e/.auth/nonprofit.json' });
test.describe.configure({ mode: 'serial' });

test('nonprofit is redirected to /nonprofit dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/nonprofit', { timeout: 10_000 });
});

test('Available Products tab shows the supplier product with Claim enabled', async ({
  page,
}) => {
  await page.goto('/nonprofit');

  // Open Available Products tab
  await page.getByRole('button', { name: /available products/i }).click();

  // Product posted in test 02 should be visible
  await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({
    timeout: 10_000,
  });

  // Since admin approved the nonprofit in test 01, the Claim button must be enabled.
  // Used the same .space-y-4 > div pattern but a testId could be better after a review
  const claimButton = page
    .locator('.space-y-4 > div')
    .filter({ hasText: TEST_PRODUCT_NAME })
    .getByRole('button', { name: /claim this product/i });

  await expect(claimButton).toBeEnabled();
});

test('nonprofit claims the product and it moves to My Claims', async ({
  page,
}) => {
  // Mocked emails
  await page.route('**/api/product-request-claimed-emails', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/nonprofit');
  await page.getByRole('button', { name: /available products/i }).click();

  await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({
    timeout: 10_000,
  });

  // Click "Claim This Product" on the correct product card
  const productCard = page.locator('.space-y-4 > div').filter({
    hasText: TEST_PRODUCT_NAME,
  });
  await productCard
    .getByRole('button', { name: /claim this product/i })
    .click();

  // Confirm in the modal
  await expect(
    page.getByRole('heading', { name: /claim this product/i })
  ).toBeVisible();
  await page.getByRole('button', { name: /confirm claim/i }).click();

  // Product card should vanish from the available list.
  await expect(
    page.locator('.space-y-4 > div').filter({ hasText: TEST_PRODUCT_NAME })
  ).not.toBeVisible({ timeout: 8_000 });
});

test('claimed product appears under My Claims tab', async ({ page }) => {
  await page.goto('/nonprofit');

  // Open My Claims tab
  await page.getByRole('button', { name: /my claims/i }).click();

  await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({
    timeout: 8_000,
  });
});
