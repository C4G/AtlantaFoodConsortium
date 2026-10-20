/**
 * E2E Global Setup
 *
 * Runs once before all tests. Responsibilities:
 *  1. Load environment variables from dev.env
 *  2. Clean up any leftover test data from prior runs
 *  3. Seed the DB with one admin, one supplier, one nonprofit
 *  4. Create a NextAuth DB session for each user
 *  5. Write Playwright auth storageState files (.auth/*.json)
 *  6. Write the shared test-state.json with entity IDs for use in specs
 */

import './load-env';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  E2E_PREFIX,
  TEST_ADMIN_EMAIL,
  TEST_SUPPLIER_EMAIL,
  TEST_NONPROFIT_EMAIL,
  TEST_SUPPLIER_NAME,
  TEST_NONPROFIT_NAME,
  EDGE_CASE_PRODUCT_NAME,
  writeState,
} from './shared-state';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// ─── Cleanup helpers ────────────────────
async function cleanupTestData(prisma: PrismaClient) {
  await prisma.session.deleteMany({
    where: { user: { email: { startsWith: E2E_PREFIX } } },
  });

  const testSupplierIds = (
    await prisma.supplier.findMany({
      where: { name: { startsWith: E2E_PREFIX } },
      select: { id: true },
    })
  ).map((s) => s.id);

  if (testSupplierIds.length > 0) {
    await prisma.productRequest.deleteMany({
      where: { supplierId: { in: testSupplierIds } },
    });
  }

  await prisma.user.deleteMany({
    where: { email: { startsWith: E2E_PREFIX } },
  });

  await prisma.supplier.deleteMany({
    where: { name: { startsWith: E2E_PREFIX } },
  });
  await prisma.nonprofit.deleteMany({
    where: { name: { startsWith: E2E_PREFIX } },
  });

  await prisma.nonprofitDocument.deleteMany({
    where: { fileName: { startsWith: 'e2e-test' } },
  });
}

async function globalSetup() {
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('\nE2E global setup starting…');
    await cleanupTestData(prisma);

    const adminUser = await prisma.user.create({
      data: {
        email: TEST_ADMIN_EMAIL,
        name: 'E2E Admin',
        emailVerified: new Date(),
        role: 'ADMIN',
      },
    });

    const supplier = await prisma.supplier.create({
      data: { name: TEST_SUPPLIER_NAME, cadence: 'WEEKLY' },
    });

    const supplierUser = await prisma.user.create({
      data: {
        email: TEST_SUPPLIER_EMAIL,
        name: 'E2E Supplier User',
        title: 'Supply Coordinator',
        phoneNumber: '4045550001',
        emailVerified: new Date(),
        role: 'SUPPLIER',
        supplierId: supplier.id,
      },
    });

    const nonprofitDoc = await prisma.nonprofitDocument.create({
      data: {
        fileName: 'e2e-test-document.pdf',
        fileType: 'application/pdf',
        filePath: '/test/e2e-test-document.pdf',
      },
    });

    const productInterests = await prisma.productInterests.create({
      data: {
        protein: true,
        produce: true,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
      },
    });

    const nonprofit = await prisma.nonprofit.create({
      data: {
        name: TEST_NONPROFIT_NAME,
        organizationType: 'FOOD_BANK',
        nonprofitDocumentId: nonprofitDoc.id,
        nonprofitDocumentApproval: null, // pending
        coldStorageSpace: true,
        shelfSpace: true,
        donationsOrPurchases: ['DONATIONS'],
        transportationAvailable: true,
      },
    });

    const nonprofitUser = await prisma.user.create({
      data: {
        email: TEST_NONPROFIT_EMAIL,
        name: 'E2E Nonprofit User',
        title: 'Program Director',
        phoneNumber: '4045550002',
        emailVerified: new Date(),
        role: 'NONPROFIT',
        nonprofitId: nonprofit.id,
        productSurveyId: productInterests.id,
      },
    });

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const adminToken = crypto.randomUUID();
    const supplierToken = crypto.randomUUID();
    const nonprofitToken = crypto.randomUUID();

    await prisma.session.createMany({
      data: [
        { sessionToken: adminToken, userId: adminUser.id, expires },
        { sessionToken: supplierToken, userId: supplierUser.id, expires },
        { sessionToken: nonprofitToken, userId: nonprofitUser.id, expires },
      ],
    });

    // ── Playwright storageState files ──────────────────────────────────
    const authDir = path.join(process.cwd(), 'e2e', '.auth');
    fs.mkdirSync(authDir, { recursive: true });

    const cookieExpires = Math.floor(expires.getTime() / 1000);

    const storageState = (token: string) => ({
      cookies: [
        {
          name: 'authjs.session-token',
          value: token,
          domain: 'localhost',
          path: '/',
          expires: cookieExpires,
          httpOnly: true,
          secure: false,
          sameSite: 'Lax' as const,
        },
      ],
      origins: [],
    });

    fs.writeFileSync(
      path.join(authDir, 'admin.json'),
      JSON.stringify(storageState(adminToken), null, 2)
    );
    fs.writeFileSync(
      path.join(authDir, 'supplier.json'),
      JSON.stringify(storageState(supplierToken), null, 2)
    );
    fs.writeFileSync(
      path.join(authDir, 'nonprofit.json'),
      JSON.stringify(storageState(nonprofitToken), null, 2)
    );

    writeState({
      adminUserId: adminUser.id,
      supplierUserId: supplierUser.id,
      supplierId: supplier.id,
      nonprofitUserId: nonprofitUser.id,
      nonprofitId: nonprofit.id,
    });

    // Seeded directly so it is always AVAILABLE even after test 03 claims
    // the main product. Used by test 05 (unapproved-nonprofit edge case).
    const edgeProductType = await prisma.productType.create({
      data: {
        produce: true,
        protein: false,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
      },
    });
    const edgePickupInfo = await prisma.pickupInfo.create({
      data: {
        pickupDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        pickupTimeframe: ['MORNING'],
        pickupLocation: '999 Edge Case Ave, Atlanta, GA 30301',
        pickupInstructions: 'Edge case test product',
        contactName: 'Edge Tester',
        contactPhone: '4045550099',
      },
    });
    await prisma.productRequest.create({
      data: {
        name: EDGE_CASE_PRODUCT_NAME,
        unit: 'POUNDS',
        quantity: 50,
        description:
          'Seeded directly for edge-case tests. Not part of main flow.',
        status: 'AVAILABLE',
        supplierId: supplier.id,
        productTypeId: edgeProductType.id,
        pickupInfoId: edgePickupInfo.id,
      },
    });

    console.log('E2E global setup complete');
    console.log(`Admin: ${TEST_ADMIN_EMAIL}`);
    console.log(
      `Supplier: ${TEST_SUPPLIER_EMAIL} (org: ${TEST_SUPPLIER_NAME})`
    );
    console.log(
      `Nonprofit: ${TEST_NONPROFIT_EMAIL} (org: ${TEST_NONPROFIT_NAME})`
    );
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
