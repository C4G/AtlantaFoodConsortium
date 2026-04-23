/**
 * Test 07 — User creates a discussion thread and email notification is triggered
 *
 * Steps:
 *   1. Admin navigates to /discussion
 *   2. Clicks "New Thread"
 *   3. Fills title, content, and group target
 *   4. Submits — POST /api/threads is called
 *   5. POST /api/discussion-emails is triggered with the new thread ID
 *   6. New thread row appears in the grid
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

const TEST_THREAD_TITLE = `${E2E_PREFIX} Test Discussion Thread`;
const TEST_THREAD_CONTENT =
  'This is an automated E2E test discussion thread. Please ignore.';

test.afterAll(async () => {
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.thread.deleteMany({
      where: { title: { startsWith: E2E_PREFIX } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test('admin navigates to /discussion page', async ({ page }) => {
  await page.goto('/discussion');
  await expect(
    page.getByRole('heading', { name: /discussion threads/i })
  ).toBeVisible();
});

test('user creates a discussion thread and email endpoint is called', async ({
  page,
}) => {
  let discussionEmailCalled = false;
  let capturedThreadId: string | undefined;

  // Capture the thread ID from the create API response
  await page.route('**/api/threads', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.continue();
    }
    const response = await route.fetch();
    const body = await response.json();
    if (body?.id) {
      capturedThreadId = body.id as string;
    }
    await route.fulfill({ response });
  });

  // Mock the email endpoint so no real emails are sent
  await page.route('**/api/discussion-emails', async (route) => {
    discussionEmailCalled = true;
    const requestBody = route.request().postDataJSON();
    expect(requestBody.threadId).toBeTruthy();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, sent: 3 }),
    });
  });

  await page.goto('/discussion');

  // Open the create dialog
  await page.getByRole('button', { name: /new thread/i }).click();

  await expect(
    page.getByRole('heading', { name: /create new thread/i })
  ).toBeVisible();

  // Fill the form
  await page.getByPlaceholder('Thread Title').fill(TEST_THREAD_TITLE);
  await page
    .getByPlaceholder('Share your thoughts, questions, or ideas...')
    .fill(TEST_THREAD_CONTENT);

  // Submit
  await page.getByRole('button', { name: 'Create Thread' }).click();

  // Wait for the new thread row to appear in the grid
  await expect(page.getByText(TEST_THREAD_TITLE)).toBeVisible({
    timeout: 8_000,
  });

  // Verify the email endpoint was triggered
  expect(discussionEmailCalled).toBe(true);
  expect(capturedThreadId).toBeTruthy();
});
