/**
 * Test 06 — Admin creates an announcement and email notification is triggered
 *
 * Steps:
 *   1. Admin navigates to /announcements
 *   2. Clicks "New Announcement"
 *   3. Fills title, content, and group target
 *   4. Submits — POST /api/admin-announcements is called
 *   5. POST /api/announcement-emails is triggered with the new announcement ID
 *   6. New announcement row appears in the grid
 */

import { test, expect } from '@playwright/test';
import '../load-env';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { E2E_PREFIX } from '../shared-state';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

test.use({ storageState: 'e2e/.auth/admin.json' });
test.describe.configure({ mode: 'serial' });

const TEST_ANNOUNCEMENT_TITLE = `${E2E_PREFIX} Test Announcement`;
const TEST_ANNOUNCEMENT_CONTENT =
  'This is an automated E2E test announcement. Please ignore.';

test.afterAll(async () => {
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.announcement.deleteMany({
      where: { title: { startsWith: E2E_PREFIX } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test('admin navigates to /announcements page', async ({ page }) => {
  await page.goto('/announcements');
  await expect(
    page.getByRole('heading', { name: /announcement system/i })
  ).toBeVisible();
});

test('admin creates an announcement and email endpoint is called', async ({
  page,
}) => {
  let announcementEmailCalled = false;
  let capturedAnnouncementId: string | undefined;

  // Capture the announcement ID from the create API response
  await page.route('**/api/admin-announcements', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }
    const response = await route.fetch();
    const body = await response.json();
    if (body?.id) {
      capturedAnnouncementId = body.id as string;
    }
    await route.fulfill({ response });
  });

  // Mock the email endpoint so no real emails are sent
  await page.route('**/api/announcement-emails', async (route) => {
    announcementEmailCalled = true;
    const requestBody = route.request().postDataJSON();
    expect(requestBody.announcementId).toBeTruthy();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, sent: 2 }),
    });
  });

  await page.goto('/announcements');

  // Open the create dialog
  await page.getByRole('button', { name: /new announcement/i }).click();

  await expect(
    page.getByRole('heading', { name: /create new announcement/i })
  ).toBeVisible();

  // Fill the form
  await page
    .getByPlaceholder('Enter announcement title')
    .fill(TEST_ANNOUNCEMENT_TITLE);
  await page
    .getByPlaceholder('Enter announcement content')
    .fill(TEST_ANNOUNCEMENT_CONTENT);

  // Submit
  await page.getByRole('button', { name: 'Create' }).click();

  // Wait for the row to appear in the grid
  await expect(page.getByText(TEST_ANNOUNCEMENT_TITLE)).toBeVisible({
    timeout: 8_000,
  });

  // Verify the email endpoint was triggered
  expect(announcementEmailCalled).toBe(true);
  expect(capturedAnnouncementId).toBeTruthy();
});
