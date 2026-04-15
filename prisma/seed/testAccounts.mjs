const TEST_SUPPLIER_NAME = 'test-Test Supplier Co';
const TEST_NONPROFIT_NAME = 'test-Test Nonprofit Org';

const TEST_PRODUCTS = [
  { name: 'Fresh Chicken', unit: 'POUNDS', quantity: 200, status: 'AVAILABLE', protein: true, proteinTypes: ['POULTRY'] },
  { name: 'Canned Beans',  unit: 'CASES',  quantity: 50,  status: 'AVAILABLE', shelfStable: true, shelfStableType: 'Canned goods' },
  { name: 'Fresh Vegetables', unit: 'POUNDS', quantity: 150, status: 'RESERVED', produce: true, produceType: 'Mixed seasonal vegetables' },
  { name: 'Rice Bags',    unit: 'BAGS',   quantity: 80,  status: 'PENDING',   shelfStable: true, shelfStableType: 'Dry goods' },
  { name: 'Bread Loaves', unit: 'COUNT',  quantity: 60,  status: 'AVAILABLE', alreadyPreparedFood: true, alreadyPreparedFoodType: 'Fresh baked bread' },
];

export const TEST_ACCOUNTS = [
  { role: 'ADMIN',     email: 'test-admin@afc.dev',    name: 'Test Admin',    phone: '4040000001' },
  { role: 'SUPPLIER',  email: 'test-supplier@afc.dev', name: 'Test Supplier', phone: '4040000002' },
  { role: 'NONPROFIT', email: 'test-nonprofit@afc.dev',name: 'Test Nonprofit',phone: '4040000003' },
  { role: 'OTHER',     email: 'test-other@afc.dev',    name: 'Test Other',    phone: '4040000004' },
];

export const seedTestAccounts = async (prisma) => {
  const existing = await prisma.user.count({
    where: { email: { in: TEST_ACCOUNTS.map((a) => a.email) } },
  });

  if (existing === TEST_ACCOUNTS.length) {
    console.log('Test accounts already seeded, skipping...');
    return;
  }

  console.log('Seeding hardcoded test accounts...');

  await prisma.user.upsert({
    where: { email: 'test-admin@afc.dev' },
    update: {},
    create: {
      name: 'Test Admin',
      email: 'test-admin@afc.dev',
      emailVerified: new Date(),
      role: 'ADMIN',
      phoneNumber: '4040000001',
    },
  });

  const testSupplier = await prisma.supplier.upsert({
    where: { name: TEST_SUPPLIER_NAME },
    update: {},
    create: { name: TEST_SUPPLIER_NAME, cadence: 'WEEKLY' },
  });

  await prisma.user.upsert({
    where: { email: 'test-supplier@afc.dev' },
    update: {},
    create: {
      name: 'Test Supplier',
      email: 'test-supplier@afc.dev',
      emailVerified: new Date(),
      role: 'SUPPLIER',
      supplierId: testSupplier.id,
      phoneNumber: '4040000002',
    },
  });

  // Seed product requests for the test supplier so the dashboard has data
  const existingProducts = await prisma.productRequest.count({
    where: { supplierId: testSupplier.id },
  });

  if (existingProducts === 0) {
    for (const p of TEST_PRODUCTS) {
      const pickupDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const productType = await prisma.productType.create({
        data: {
          protein: p.protein ?? false,
          proteinTypes: p.proteinTypes ?? [],
          produce: p.produce ?? false,
          produceType: p.produceType ?? null,
          shelfStable: p.shelfStable ?? false,
          shelfStableType: p.shelfStableType ?? null,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: p.alreadyPreparedFood ?? false,
          alreadyPreparedFoodType: p.alreadyPreparedFoodType ?? null,
          other: false,
        },
      });

      const pickupInfo = await prisma.pickupInfo.create({
        data: {
          pickupDate,
          pickupTimeframe: ['MORNING'],
          pickupLocation: '123 Test Ave, Atlanta, GA 30301',
          pickupInstructions: 'Call upon arrival.',
          contactName: 'Test Supplier',
          contactPhone: '4040000002',
        },
      });

      await prisma.productRequest.create({
        data: {
          name: p.name,
          unit: p.unit,
          quantity: p.quantity,
          description: `${p.name} available for pickup.`,
          status: p.status,
          supplierId: testSupplier.id,
          productTypeId: productType.id,
          pickupInfoId: pickupInfo.id,
        },
      });
    }
    console.log(`  Created ${TEST_PRODUCTS.length} products for test supplier`);
  }

  const existingNonprofitUser = await prisma.user.findFirst({
    where: { email: 'test-nonprofit@afc.dev' },
  });

  if (!existingNonprofitUser) {
    const nonprofitDoc = await prisma.nonprofitDocument.create({
      data: {
        fileName: 'test-nonprofit-501c3.pdf',
        fileType: 'application/pdf',
        filePath: '/test/test-nonprofit-501c3.pdf',
      },
    });

    const productInterests = await prisma.productInterests.create({
      data: {
        protein: true,
        produce: true,
        shelfStable: true,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
      },
    });

    const testNonprofit = await prisma.nonprofit.create({
      data: {
        name: TEST_NONPROFIT_NAME,
        organizationType: 'FOOD_BANK',
        nonprofitDocumentId: nonprofitDoc.id,
        nonprofitDocumentApproval: true,
        coldStorageSpace: true,
        shelfSpace: true,
        donationsOrPurchases: ['DONATIONS'],
        transportationAvailable: true,
      },
    });

    await prisma.user.create({
      data: {
        name: 'Test Nonprofit',
        email: 'test-nonprofit@afc.dev',
        emailVerified: new Date(),
        role: 'NONPROFIT',
        nonprofitId: testNonprofit.id,
        productSurveyId: productInterests.id,
        phoneNumber: '4040000003',
      },
    });
  }

  await prisma.user.upsert({
    where: { email: 'test-other@afc.dev' },
    update: {},
    create: {
      name: 'Test Other',
      email: 'test-other@afc.dev',
      emailVerified: new Date(),
      role: 'OTHER',
      phoneNumber: '4040000004',
    },
  });

  console.log('Test accounts seeded:');
  for (const account of TEST_ACCOUNTS) {
    console.log(`  [${account.role}] ${account.email}`);
  }
};