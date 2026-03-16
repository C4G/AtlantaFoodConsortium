/**
 * Test 04 — Status verification across all three roles
 *
 * Pre-condition: test 03 has set the product to RESERVED.
 *
 * Each describe block uses a different storageState so we can check
 * the same product from three separate role perspectives in one file.
 */

import { test, expect } from '@playwright/test';
import { TEST_PRODUCT_NAME, TEST_NONPROFIT_NAME } from '../shared-state';

// Supplier view
test.describe('Supplier dashboard — product shows as RESERVED', () => {
  test.use({ storageState: 'e2e/.auth/supplier.json' });

  test('product is listed with RESERVED status in the pickup-request table', async ({
    page,
  }) => {
    await page.goto('/supplier');
    await page.getByRole('button', { name: /my products/i }).click();

    // ag-grid cells contain the status; scope RESERVED check to the specific product row
    const productRow = page
      .getByRole('row')
      .filter({ hasText: TEST_PRODUCT_NAME });
    await expect(productRow).toBeVisible({ timeout: 8_000 });
    await expect(productRow).toContainText('RESERVED');
  });
});

// Admin view

test.describe('Admin dashboard — product shows RESERVED with claiming nonprofit', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });

  test('Product Requests tab shows the product as RESERVED', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.getByText('Product Requests', { exact: true }).click();

    const productRow = page
      .getByRole('row')
      .filter({ hasText: TEST_PRODUCT_NAME });
    await expect(productRow).toBeVisible({ timeout: 8_000 });
    await expect(productRow).toContainText('RESERVED');
  });

  test('claiming nonprofit name is shown on the product row', async ({
    page,
  }) => {
    await page.goto('/admin');
    await page.getByText('Product Requests', { exact: true }).click();

    // The row for our product should contain the nonprofit's name
    const productRow = page
      .getByRole('row')
      .filter({ hasText: TEST_PRODUCT_NAME });

    await expect(productRow).toContainText(TEST_NONPROFIT_NAME);
  });
});

// Nonprofit view

test.describe('Nonprofit dashboard — product appears under My Claims', () => {
  test.use({ storageState: 'e2e/.auth/nonprofit.json' });

  test('My Claims tab contains the claimed product', async ({ page }) => {
    await page.goto('/nonprofit');
    await page.getByRole('button', { name: /my claims/i }).click();

    await expect(page.getByText(TEST_PRODUCT_NAME)).toBeVisible({
      timeout: 8_000,
    });
  });

  test('Available Products tab no longer contains the claimed product', async ({
    page,
  }) => {
    await page.goto('/nonprofit');
    await page.getByRole('button', { name: /available products/i }).click();

    // The product should NOT be visible — it was claimed
    await expect(page.getByText(TEST_PRODUCT_NAME)).not.toBeVisible({
      timeout: 6_000,
    });
  });
});
