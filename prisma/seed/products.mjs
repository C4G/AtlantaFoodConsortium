import { pick, getRandomDateInPast, getRandomDateInFuture, buildProductTypeData } from './helpers.mjs';

const seedProductRequests = async (prisma, suppliers, nonprofits) => {
  const existing = await prisma.productRequest.count();
  if (existing > 0) {
    console.log(`Product requests already seeded (${existing} found), skipping...`);
    return await prisma.productRequest.findMany();
  }
  console.log('Seeding product requests...');

  const productTypes = [
    { name: 'Fresh Chicken', protein: true, proteinTypes: ['POULTRY', 'FRESH'], produce: false },
    { name: 'Frozen Beef', protein: true, proteinTypes: ['BEEF', 'FROZEN'], produce: false },
    { name: 'Fresh Vegetables', protein: false, produce: true, produceType: 'Mixed seasonal vegetables' },
    { name: 'Canned Beans', protein: false, shelfStable: true, shelfStableType: 'Canned goods' },
    { name: 'Rice Bags', protein: false, shelfStable: true, shelfStableType: 'Dry goods' },
    { name: 'Frozen Seafood', protein: true, proteinTypes: ['SEAFOOD', 'FROZEN'], produce: false },
    { name: 'Fresh Fruit', protein: false, produce: true, produceType: 'Seasonal fruits' },
    { name: 'Bread Loaves', protein: false, alreadyPreparedFood: true, alreadyPreparedFoodType: 'Fresh baked bread' },
    { name: 'Granola Bars', protein: false, shelfStableIndividualServing: true, shelfStableIndividualServingType: 'Snack bars' },
    { name: 'Dairy Products', protein: false, other: true, otherType: 'Milk and cheese' },
  ];

  const units = ['POUNDS', 'CASES', 'BOXES', 'BAGS', 'COUNT'];
  const statuses = ['AVAILABLE', 'RESERVED', 'PENDING'];
  const timeframes = ['MORNING', 'MID_DAY', 'AFTERNOON'];
  const streets = ['Main St', 'Oak Ave', 'Peachtree Rd', 'Spring St', 'Piedmont Ave'];
  const contacts = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown'];
  const approvedNonprofits = nonprofits.filter(n => n.nonprofitDocumentApproval === true);

  const createdProducts = [];
  for (let i = 0; i < 100; i++) {
    const supplier = pick(suppliers);
    const t = pick(productTypes);
    const createdDate = getRandomDateInPast(90);
    const daysOld = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));

    const isClaimed = daysOld > 5 && Math.random() > 0.3;
    const status = isClaimed ? pick(statuses.slice(1)) : 'AVAILABLE';
    const claimedBy = isClaimed && approvedNonprofits.length > 0 ? pick(approvedNonprofits).id : null;

    const productType = await prisma.productType.create({ data: buildProductTypeData(t) });

    const pickupInfo = await prisma.pickupInfo.create({
      data: {
        pickupDate: getRandomDateInFuture(30),
        pickupTimeframe: [pick(timeframes)],
        pickupLocation: `${Math.floor(Math.random() * 9999)} ${pick(streets)}, Atlanta, GA`,
        pickupInstructions: 'Please call upon arrival.',
        contactName: pick(contacts),
        contactPhone: `404555${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      },
    });

    const product = await prisma.productRequest.create({
      data: {
        name: `${t.name} - Batch ${i + 1}`,
        unit: pick(units),
        quantity: Math.floor(Math.random() * 100) + 10,
        description: `${t.name} available for pickup.`,
        productTypeId: productType.id,
        status,
        supplierId: supplier.id,
        claimedById: claimedBy,
        pickupInfoId: pickupInfo.id,
        createdAt: createdDate,
        updatedAt: isClaimed ? new Date(createdDate.getTime() + Math.random() * 864e5 * 3) : createdDate,
      },
    });
    createdProducts.push(product);
  }

  console.log(`Created ${createdProducts.length} product requests total`);
  return createdProducts;
};

const seedProductInterests = async (prisma, nonprofits) => {
  const existing = await prisma.productInterests.count();
  if (existing > 0) {
    console.log(`Product interests already seeded (${existing} found), skipping...`);
    return await prisma.productInterests.findMany();
  }
  console.log('Seeding product interests...');

  const interestTemplates = [
    { protein: true, proteinTypes: ['POULTRY', 'BEEF'], produce: true, produceType: 'All vegetables' },
    { protein: true, proteinTypes: ['SEAFOOD', 'FROZEN'], shelfStable: true, shelfStableType: 'Canned goods' },
    { produce: true, produceType: 'Fruits and vegetables', shelfStableIndividualServing: true, shelfStableIndividualServingType: 'Snacks' },
    { protein: true, proteinTypes: ['BEEF', 'POULTRY'], alreadyPreparedFood: true, alreadyPreparedFoodType: 'Ready meals' },
    { shelfStable: true, shelfStableType: 'Dry goods', other: true, otherType: 'Dairy products' },
  ];

  const createdInterests = [];
  for (const nonprofit of nonprofits) {
    const interest = await prisma.productInterests.create({ data: buildProductTypeData(pick(interestTemplates)) });
    createdInterests.push(interest);
  }

  console.log(`Created ${createdInterests.length} product interest profiles`);
  return createdInterests;
};

export { seedProductRequests, seedProductInterests };
