/**
 * Test 01 — Admin approves the nonprofit
 *
 * Steps:
 *   1. Admin navigates to /admin -> redirected automatically
 *   2. Clicks the Nonprofits tab
 *   3. Finds the E2E nonprofit under "Pending Approvals"
 *   4. Clicks Approve -> confirmation modal -> Confirm Approval
 *   5. Asserts the row moves to "Approved" status
 *
 * this is irst: nonprofitDocumentApproval must be true before
 * the nonprofit can claim a product
 */

import { test, expect } from '@playwright/test';
import { TEST_NONPROFIT_NAME } from '../shared-state';

test.use({ storageState: 'e2e/.auth/admin.json' });
test.describe.configure({ mode: 'serial' });

test('admin is redirected to /admin dashboard', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/admin', { timeout: 10_000 });
  await expect(
    page.getByRole('heading', { name: 'Admin Dashboard' })
  ).toBeVisible();
});

test('Nonprofits tab shows the test nonprofit under Pending Approvals', async ({
  page,
}) => {
  await page.goto('/admin');

  await page.getByText('Nonprofits', { exact: true }).click();

  await expect(page.getByText('Pending Approvals')).toBeVisible();
  await expect(page.getByText(TEST_NONPROFIT_NAME)).toBeVisible();
});

test('admin approves the nonprofit and status updates to Approved', async ({
  page,
}) => {
  // Mocked the approval-status email endpoint
  await page.route('**/api/nonprofit-approval-status-emails', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/admin');
  await page.getByText('Nonprofits', { exact: true }).click();

  // Locate the Approve button in the row containing our test nonprofit name
  const nonprofitRow = page
    .getByRole('row')
    .filter({ hasText: TEST_NONPROFIT_NAME });

  await nonprofitRow.getByRole('button', { name: /approve/i }).click();

  // Confirmation modal
  await expect(
    page.getByRole('heading', { name: /approve nonprofit/i })
  ).toBeVisible();
  await page.getByRole('button', { name: /confirm approval/i }).click();

  // The nonprofit row should show the approve badge
  await expect(
    page.getByRole('row').filter({ hasText: TEST_NONPROFIT_NAME })
  ).toContainText('Approved', { timeout: 8_000 });
});
