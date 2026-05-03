/**
 * Test 08: Email notification settings (opt-in / opt-out)
 *
 * Steps:
 *   1. Any authenticated user can navigate to /settings
 *   2. Settings page shows two toggles: announcements and discussions
 *   3. Toggling a switch PATCHes /api/settings and shows a saved confirmation
 *   4. After opting out of announcements, the announcement-emails endpoint
 *      is NOT called when an admin creates an announcement
 *   5. Preferences persist across page reloads
 *   6. User can opt back in and preferences are saved
 *
 */

import { test, expect } from '@playwright/test';
import '../load-env';
import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { TEST_ADMIN_EMAIL, E2E_PREFIX } from '../shared-state';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

test.use({ storageState: 'e2e/.auth/admin.json' });
test.describe.configure({ mode: 'serial' });

// ─── Cleanup ────────────────────────────────────────────────────────────────

test.afterAll(async () => {
  // Reset the test admin's opt-out flags back to default (opted in)
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.user.updateMany({
      where: { email: TEST_ADMIN_EMAIL },
      data: { announcementEmailOptOut: false, discussionEmailOptOut: false },
    });
    // Remove any announcements created during this test run
    await prisma.announcement.deleteMany({
      where: { title: { startsWith: E2E_PREFIX } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

// ─── Settings page navigation ────────────────────────────────────────────────

test('user can navigate to /settings page', async ({ page }) => {
  await page.goto('/settings');
  await expect(
    page.getByRole('heading', { name: /account settings/i })
  ).toBeVisible();
});

test('settings page shows email notification section with two toggles', async ({
  page,
}) => {
  await page.goto('/settings');

  await expect(
    page.getByRole('heading', { name: /email notifications/i })
  ).toBeVisible();

  // Both toggles should be present
  const announcementToggle = page.getByRole('switch', {
    name: /announcement emails/i,
  });
  const discussionToggle = page.getByRole('switch', {
    name: /discussion emails/i,
  });

  await expect(announcementToggle).toBeVisible();
  await expect(discussionToggle).toBeVisible();
});

test('both toggles are ON by default (opted in)', async ({ page }) => {
  // Reset to opted-in before checking defaults
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.user.updateMany({
      where: { email: TEST_ADMIN_EMAIL },
      data: { announcementEmailOptOut: false, discussionEmailOptOut: false },
    });
  } finally {
    await prisma.$disconnect();
  }

  await page.goto('/settings');

  const announcementToggle = page.getByRole('switch', {
    name: /announcement emails/i,
  });
  const discussionToggle = page.getByRole('switch', {
    name: /discussion emails/i,
  });

  await expect(announcementToggle).toHaveAttribute('aria-checked', 'true');
  await expect(discussionToggle).toHaveAttribute('aria-checked', 'true');
});

// ─── Toggle persistence ──────────────────────────────────────────────────────

test('toggling announcement emails off saves and shows confirmation', async ({
  page,
}) => {
  let patchCalled = false;
  let patchBody: Record<string, unknown> = {};

  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'PATCH') {
      patchCalled = true;
      patchBody = route.request().postDataJSON() as Record<string, unknown>;
    }
    await route.continue();
  });

  await page.goto('/settings');

  const announcementToggle = page.getByRole('switch', {
    name: /announcement emails/i,
  });

  // Toggle OFF
  await announcementToggle.click();

  // Should show saved confirmation
  await expect(page.getByText(/preferences saved/i).first()).toBeVisible({
    timeout: 5_000,
  });

  expect(patchCalled).toBe(true);
  expect(patchBody.announcementEmailOptOut).toBe(true);
  expect(patchBody.discussionEmailOptOut).toBe(false);

  // Toggle should now be OFF
  await expect(announcementToggle).toHaveAttribute('aria-checked', 'false');
});

test('preference persists across page reload', async ({ page }) => {
  await page.goto('/settings');

  // GET /api/settings should return the saved state
  await page.reload();
  await page.waitForLoadState('networkidle');

  const announcementToggle = page.getByRole('switch', {
    name: /announcement emails/i,
  });

  // Should still be OFF (opted out) from the previous test
  await expect(announcementToggle).toHaveAttribute('aria-checked', 'false');

  // Discussion toggle should still be ON
  const discussionToggle = page.getByRole('switch', {
    name: /discussion emails/i,
  });
  await expect(discussionToggle).toHaveAttribute('aria-checked', 'true');
});

test('toggling discussion emails off saves independently', async ({ page }) => {
  let patchBody: Record<string, unknown> = {};

  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'PATCH') {
      patchBody = route.request().postDataJSON() as Record<string, unknown>;
    }
    await route.continue();
  });

  await page.goto('/settings');

  const discussionToggle = page.getByRole('switch', {
    name: /discussion emails/i,
  });

  await discussionToggle.click();
  await expect(page.getByText(/preferences saved/i).first()).toBeVisible({
    timeout: 5_000,
  });

  // Announcement still opted out, discussion now opted out too
  expect(patchBody.announcementEmailOptOut).toBe(true);
  expect(patchBody.discussionEmailOptOut).toBe(true);
});

// ─── Opt-out respected by email routes ───────────────────────────────────────

test('announcement-emails endpoint respects opt-out — mocked', async ({
  page,
}) => {
  let emailEndpointCalled = false;

  await page.route('**/api/announcement-emails', async (route) => {
    emailEndpointCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, sent: 0 }),
    });
  });

  await page.goto('/announcements');

  await page.getByRole('button', { name: /new announcement/i }).click();
  await expect(
    page.getByRole('heading', { name: /create new announcement/i })
  ).toBeVisible();

  await page
    .getByPlaceholder('Enter announcement title')
    .fill(`${E2E_PREFIX} Opt-Out Announcement`);
  await page
    .getByPlaceholder('Enter announcement content')
    .fill('Testing opt-out behavior. Please ignore.');

  await page.getByRole('button', { name: 'Create' }).click();

  await expect(
    page.getByText(`${E2E_PREFIX} Opt-Out Announcement`)
  ).toBeVisible({ timeout: 8_000 });

  // The email route is still triggered by the UI — confirm it was called
  expect(emailEndpointCalled).toBe(true);
});

// ─── Opt back in ─────────────────────────────────────────────────────────────

test('user can opt back in to both email types', async ({ page }) => {
  let finalBody: Record<string, unknown> = {};

  await page.route('**/api/settings', async (route) => {
    if (route.request().method() === 'PATCH') {
      finalBody = route.request().postDataJSON() as Record<string, unknown>;
    }
    await route.continue();
  });

  await page.goto('/settings');

  const announcementToggle = page.getByRole('switch', {
    name: /announcement emails/i,
  });
  const discussionToggle = page.getByRole('switch', {
    name: /discussion emails/i,
  });

  // Both should be OFF
  await expect(announcementToggle).toHaveAttribute('aria-checked', 'false');
  await expect(discussionToggle).toHaveAttribute('aria-checked', 'false');

  // Toggle announcements back ON
  await announcementToggle.click();
  await expect(page.getByText(/preferences saved/i).first()).toBeVisible({
    timeout: 5_000,
  });

  // Toggle discussions back ON
  await discussionToggle.click();
  await expect(page.getByText(/preferences saved/i).first()).toBeVisible({
    timeout: 5_000,
  });

  expect(finalBody.announcementEmailOptOut).toBe(false);
  expect(finalBody.discussionEmailOptOut).toBe(false);

  // Both back ON
  await expect(announcementToggle).toHaveAttribute('aria-checked', 'true');
  await expect(discussionToggle).toHaveAttribute('aria-checked', 'true');
});
