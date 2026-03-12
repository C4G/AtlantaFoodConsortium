/**
 * E2E Global Teardown
 *
 * Runs once after all tests. Removes all seeded test data from the DB
 * and deletes the generated state/auth files so the workspace stays clean.
 */

import './load-env';
import { PrismaClient } from '@prisma/client';
import { E2E_PREFIX, clearStateFile } from './shared-state';

async function globalTeardown() {
  const prisma = new PrismaClient();

  try {
    console.log('\n E2E global teardown starting…');

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

    clearStateFile();

    console.log('E2E global teardown complete');
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
