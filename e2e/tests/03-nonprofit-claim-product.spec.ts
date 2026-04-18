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

test('nonprofit partially claims 30 units — product stays in Available and appears in My Claims', async ({
  page,
}) => {
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

  const productCard = page
    .locator('.space-y-4 > div')
    .filter({ hasText: TEST_PRODUCT_NAME });
  await productCard
    .getByRole('button', { name: /claim this product/i })
    .click();

  // Modal opens — change quantity from default (100) to 30
  await expect(
    page.getByRole('heading', { name: /claim this product/i })
  ).toBeVisible();
  await page.locator('#claim-quantity').fill('30');

  // Fill required pickup contact fields (added with the partial-claim feature)
  await page.locator('#np-contact-name').fill('Test Contact');
  await page.locator('#np-contact-phone').fill('4045550099');
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 7);
  await page
    .locator('#np-pickup-date')
    .fill(pickupDate.toISOString().split('T')[0]);
  await page
    .locator('input[name="np-pickup-timeframe"][value="MORNING"]')
    .check();

  await page.getByRole('button', { name: /confirm claim/i }).click();

  // Product card should still be visible (partial claim leaves the remainder available)
  await expect(productCard).toBeVisible({ timeout: 8_000 });

  // Switch to My Claims the 30-unit entry should appear.
  // Use heading role to avoid strict-mode collision with the still-visible toast notification.
  await page.getByRole('button', { name: /my claims/i }).click();
  await expect(
    page.getByRole('heading', { name: TEST_PRODUCT_NAME })
  ).toBeVisible({
    timeout: 8_000,
  });
  await expect(page.getByText('Quantity: 30')).toBeVisible({ timeout: 5_000 });
});

test('unclaiming the partial claim restores the available quantity', async ({
  page,
}) => {
  await page.goto('/nonprofit');
  await page.getByRole('button', { name: /my claims/i }).click();

  // The 30-unit partial claim should be present
  const claimedCard = page
    .locator('[class*="rounded-lg"]')
    .filter({ hasText: TEST_PRODUCT_NAME })
    .filter({ hasText: 'Quantity: 30' });
  await expect(claimedCard).toBeVisible({ timeout: 8_000 });

  await claimedCard.getByRole('button', { name: /unclaim product/i }).click();

  // Unclaim confirmation modal
  await expect(
    page.getByRole('heading', { name: /unclaim this product/i })
  ).toBeVisible();
  await page.getByRole('button', { name: /confirm unclaim/i }).click();

  // The entry should vanish from My Claims
  await expect(claimedCard).not.toBeVisible({ timeout: 8_000 });

  // Switch to Available Products — the original product's quantity is restored to 100
  await page.getByRole('button', { name: /available products/i }).click();
  const restoredCard = page
    .locator('.space-y-4 > div')
    .filter({ hasText: TEST_PRODUCT_NAME });
  await expect(restoredCard).toBeVisible({ timeout: 8_000 });
  await expect(restoredCard).toContainText('100', { timeout: 5_000 });
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

  // Confirm in the modal — fill required pickup contact fields first
  await expect(
    page.getByRole('heading', { name: /claim this product/i })
  ).toBeVisible();
  await page.locator('#np-contact-name').fill('Test Contact');
  await page.locator('#np-contact-phone').fill('4045550099');
  const claimDate = new Date();
  claimDate.setDate(claimDate.getDate() + 7);
  await page
    .locator('#np-pickup-date')
    .fill(claimDate.toISOString().split('T')[0]);
  await page
    .locator('input[name="np-pickup-timeframe"][value="MORNING"]')
    .check();
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
