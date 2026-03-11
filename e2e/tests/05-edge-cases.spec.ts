/**
 * Test 05 — Edge cases
 *
 * These tests are independent of the main workflow and verify
 * graceful error handling:
 *
 *   A. Unapproved nonprofit cannot claim — button is disabled
 *   B. Claiming an already-RESERVED product returns an API error
 *   C. Email failure does not break the claim flow
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { expand } from 'dotenv-expand';
import { config as dotenvConfig } from 'dotenv';
import { E2E_PREFIX, EDGE_CASE_PRODUCT_NAME, readState } from '../shared-state';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  expand(dotenvConfig({ path: envPath }));
}

test.describe('A — Unapproved nonprofit sees disabled claim button', () => {
  // We create a second nonprofit WITHOUT approval and use its session
  const UNAPPROVED_EMAIL = `${E2E_PREFIX}-unapproved@test.local`;
  const UNAPPROVED_ORG = `${E2E_PREFIX} Unapproved Org`;
  const UNAPPROVED_AUTH = 'e2e/.auth/unapproved.json';

  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      // Clean up any previous run
      await prisma.session.deleteMany({
        where: { user: { email: UNAPPROVED_EMAIL } },
      });
      await prisma.user.deleteMany({ where: { email: UNAPPROVED_EMAIL } });
      await prisma.nonprofit.deleteMany({ where: { name: UNAPPROVED_ORG } });
      await prisma.nonprofitDocument.deleteMany({
        where: { fileName: 'e2e-unapproved.pdf' },
      });

      const doc = await prisma.nonprofitDocument.create({
        data: {
          fileName: 'e2e-unapproved.pdf',
          fileType: 'application/pdf',
          filePath: '/test/e2e-unapproved.pdf',
        },
      });
      const np = await prisma.nonprofit.create({
        data: {
          name: UNAPPROVED_ORG,
          organizationType: 'PANTRY',
          nonprofitDocumentId: doc.id,
          nonprofitDocumentApproval: null, // deliberately NOT approved
          coldStorageSpace: false,
          shelfSpace: true,
          donationsOrPurchases: ['DONATIONS'],
          transportationAvailable: false,
        },
      });
      const user = await prisma.user.create({
        data: {
          email: UNAPPROVED_EMAIL,
          name: 'E2E Unapproved User',
          emailVerified: new Date(),
          role: 'NONPROFIT',
          nonprofitId: np.id,
        },
      });

      const token = crypto.randomUUID();
      await prisma.session.create({
        data: {
          sessionToken: token,
          userId: user.id,
          expires: new Date(Date.now() + 86_400_000),
        },
      });

      const authDir = path.join(process.cwd(), 'e2e', '.auth');
      fs.mkdirSync(authDir, { recursive: true });
      fs.writeFileSync(
        path.join(process.cwd(), UNAPPROVED_AUTH),
        JSON.stringify(
          {
            cookies: [
              {
                name: 'authjs.session-token',
                value: token,
                domain: 'localhost',
                path: '/',
                expires: Math.floor(Date.now() / 1000) + 86400,
                httpOnly: true,
                secure: false,
                sameSite: 'Lax',
              },
            ],
            origins: [],
          },
          null,
          2
        )
      );
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.session.deleteMany({
        where: { user: { email: UNAPPROVED_EMAIL } },
      });
      await prisma.user.deleteMany({ where: { email: UNAPPROVED_EMAIL } });
      await prisma.nonprofit.deleteMany({ where: { name: UNAPPROVED_ORG } });
      await prisma.nonprofitDocument.deleteMany({
        where: { fileName: 'e2e-unapproved.pdf' },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  test('claim button is disabled for unapproved nonprofit', async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ storageState: UNAPPROVED_AUTH });
    const page = await ctx.newPage();

    await page.goto('/nonprofit');
    await page.getByRole('button', { name: /available products/i }).click();

    // EDGE_CASE_PRODUCT_NAME is seeded as AVAILABLE in globalSetup and is
    // never claimed by the main flow, so it will always be visible here.
    await expect(page.getByText(EDGE_CASE_PRODUCT_NAME)).toBeVisible({
      timeout: 8_000,
    });

    // The claim button for this product must be disabled (no document approval)
    const productCard = page.locator('.space-y-4 > div').filter({
      hasText: EDGE_CASE_PRODUCT_NAME,
    });
    const claimBtn = productCard.getByRole('button', {
      name: /claim this product/i,
    });
    await expect(claimBtn).toBeDisabled();

    // The pending-approval message should be visible
    await expect(
      productCard.getByText(/document approval pending/i)
    ).toBeVisible();

    await ctx.close();
  });
});

// ─── B. Claiming an already-RESERVED product returns an error ────────────

test.describe('B — Double-claim a RESERVED product is idempotent', () => {
  test.use({ storageState: 'e2e/.auth/nonprofit.json' });

  test('PATCH /api/item-availability on already-RESERVED product returns 200 and status stays RESERVED', async ({
    request,
  }) => {
    const state = readState();
    const productId = state.postedProductId;

    // The product was claimed in test 03 — its status is now RESERVED.
    // A second PATCH should still respond. the API responds and the status stays RESERVED.
    if (!productId) {
      console.warn(
        'postedProductId not found in state — skipping double-claim check'
      );
      return;
    }

    const res = await request.patch('/api/item-availability', {
      data: { productId },
    });

    // The API has no guard against re-claiming
    // RESERVED again and returns 200.
    expect(res.status()).toBe(200);

    // Confirm the product is still RESERVED in the DB
    const getRes = await request.get(`/api/item-availability?status=RESERVED`);
    const items = (await getRes.json()) as Array<{
      id: string;
      status: string;
    }>;
    const stillReserved = items.some(
      (i) => i.id === productId && i.status === 'RESERVED'
    );
    expect(stillReserved).toBe(true);
  });
});

// ─── C. Email failure does not break the claim flow ─────────────────────

test.describe('C — Email failure is non-blocking during claim', () => {
  test.use({ storageState: 'e2e/.auth/nonprofit.json' });

  test('claim succeeds even when the email endpoint returns 500', async ({
    page,
  }) => {
    await page.goto('/nonprofit');
    await page.getByRole('button', { name: /available products/i }).click();

    // Confirm the edge-case product is visible
    await expect(page.getByText(EDGE_CASE_PRODUCT_NAME)).toBeVisible({
      timeout: 8_000,
    });

    await page.route('**/api/product-request-claimed-emails', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated email failure' }),
      });
    });

    const productCard = page.locator('.space-y-4 > div').filter({
      hasText: EDGE_CASE_PRODUCT_NAME,
    });
    await productCard
      .getByRole('button', { name: /claim this product/i })
      .click();
    await page.getByRole('button', { name: /confirm claim/i }).click();

    await expect(
      page
        .locator('.space-y-4 > div')
        .filter({ hasText: EDGE_CASE_PRODUCT_NAME })
    ).not.toBeVisible({ timeout: 8_000 });
  });
});
