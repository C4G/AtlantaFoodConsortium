const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getRandomDateInPast(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

function getRandomDateInFuture(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
}

function buildProductTypeData(t) {
  return {
    protein: t.protein ?? false,
    proteinTypes: t.proteinTypes ?? [],
    otherProteinType: t.proteinTypes?.includes('OTHER') ? 'Custom protein' : null,
    produce: t.produce ?? false,
    produceType: t.produceType ?? null,
    shelfStable: t.shelfStable ?? false,
    shelfStableType: t.shelfStableType ?? null,
    shelfStableIndividualServing: t.shelfStableIndividualServing ?? false,
    shelfStableIndividualServingType: t.shelfStableIndividualServingType ?? null,
    alreadyPreparedFood: t.alreadyPreparedFood ?? false,
    alreadyPreparedFoodType: t.alreadyPreparedFoodType ?? null,
    other: t.other ?? false,
    otherType: t.otherType ?? null,
  };
}

export const seedSuppliers = async (prisma) => {
  console.log('Seeding suppliers...');

  const suppliers = [
    { name: 'Fresh Farms Co.', cadence: 'DAILY' },
    { name: 'Ocean Harvest Seafood', cadence: 'WEEKLY' },
    { name: 'Garden Valley Produce', cadence: 'BIWEEKLY' },
    { name: 'Sunrise Bakery', cadence: 'WEEKLY' },
    { name: 'Metro Grocery Surplus', cadence: 'DAILY' },
    { name: 'Green Fields Agriculture', cadence: 'MONTHLY' },
    { name: 'City Food Bank Distribution', cadence: 'WEEKLY' },
    { name: 'Community Kitchen Supplies', cadence: 'BIWEEKLY' },
    { name: 'Harvest Moon Organics', cadence: 'WEEKLY' },
    { name: 'Downtown Market Partners', cadence: 'TBD' },
  ];

  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: {},
      create: {
        name: supplier.name,
        cadence: supplier.cadence,
      },
    });
    createdSuppliers.push(created);
    console.log(`Created supplier: ${supplier.name}`);
  }

  return createdSuppliers;
}

export const seedNonprofits = async (prisma) => {
  const existing = await prisma.nonprofit.count();
  if (existing > 0) {
    console.log(`Nonprofits already seeded (${existing} found), skipping...`);
    return await prisma.nonprofit.findMany();
  }
  console.log('Seeding nonprofits...');

  const orgTypes = ['FOOD_BANK', 'PANTRY', 'STUDENT_PANTRY', 'FOOD_RESCUE', 'AGRICULTURE', 'OTHER'];
  const baseNames = ['Community Food Bank', 'Pantry Network', 'Student Pantry', 'Campus Food Collective',
    'Food Rescue Alliance', 'Agriculture Co-op', 'Helping Hands', 'Food Resource Center',
    'Aid Network', 'Community Kitchen', 'Meal Service', 'Food Mission', 'Outreach Center',
    'Relief Organization', 'Charity Foundation', 'Care Center', 'Support Network',
    'Wellness Hub', 'Food Cooperative', 'Distribution Center'];
  const areas = ['Atlanta', 'Downtown', 'Midtown', 'Buckhead', 'East Point', 'College Park',
    'Decatur', 'Sandy Springs', 'Marietta', 'Roswell', 'Alpharetta', 'Duluth',
    'Northside', 'Southside', 'Eastside', 'Westside', 'Metro', 'Greater Atlanta',
    'GSU', 'Emory', 'KSU', 'Georgia Tech', 'Spelman', 'Morehouse', 'Clark Atlanta'];

  const createdNonprofits = [];
  for (let i = 0; i < 40; i++) {
    const name = `${areas[i % areas.length]} ${pick(baseNames)}${i > 25 ? ` ${String.fromCharCode(65 + (i % 26))}` : ''}`;
    const rand = Math.random();
    const approved = rand < 0.7 ? true : rand < 0.9 ? null : false;

    const document = await prisma.nonprofitDocument.create({
      data: { fileName: `${name.replace(/\s+/g, '_')}_501c3.pdf`, fileData: Buffer.from('Mock PDF data'), fileType: 'application/pdf' },
    });

    const created = await prisma.nonprofit.create({
      data: {
        name,
        organizationType: pick(orgTypes),
        nonprofitDocumentId: document.id,
        nonprofitDocumentApproval: approved,
        coldStorageSpace: Math.random() > 0.5,
        shelfSpace: Math.random() > 0.3,
        donationsOrPurchases: Math.random() > 0.5 ? ['DONATIONS'] : ['DONATIONS', 'BUDGET_TO_PURCHASE'],
        transportationAvailable: Math.random() > 0.4,
      },
    });
    createdNonprofits.push(created);
  }

  console.log(`Created ${createdNonprofits.length} nonprofits total`);
  return createdNonprofits;
}

export const seedProductRequests = async (prisma, suppliers, nonprofits) => {
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
}

export const seedProductInterests = async (prisma, nonprofits) => {
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
}

export const seedSupplierUsers = async (prisma, suppliers) => {
  const existing = await prisma.user.count({ where: { role: 'SUPPLIER' } });
  if (existing > 0) {
    console.log(`Supplier users already seeded (${existing} found), skipping...`);
    return await prisma.user.findMany({ where: { role: 'SUPPLIER' } });
  }
  console.log('Seeding supplier users...');

  const createdUsers = await Promise.all(suppliers.map((supplier, i) =>
    prisma.user.create({
      data: {
        name: `${supplier.name} Manager`,
        email: `supplier${i + 1}@${supplier.name.toLowerCase().replace(/\s+/g, '')}.com`,
        role: 'SUPPLIER',
        supplierId: supplier.id,
        phoneNumber: `404555${String(1000 + i).padStart(4, '0')}`,
      },
    })
  ));

  console.log(`Created ${createdUsers.length} supplier users`);
  return createdUsers;
}

export const seedAnnouncements = async (prisma, adminUser) => {
  const existing = await prisma.announcement.count();
  if (existing > 0) {
    console.log(`Announcements already seeded (${existing} found), skipping...`);
    return;
  }
  console.log('Seeding announcements...');

  const announcements = [
    { title: 'Welcome to Atlanta Food Consortium!', content: 'We are excited to launch our new platform connecting food suppliers with nonprofits across the Atlanta area. Get started by completing your profile.', groupType: 'ALL' },
    { title: 'New Pickup Windows Available', content: 'Several suppliers have added new morning pickup windows. Check the product listings to see what\'s newly available in your area.', groupType: 'NONPROFIT' },
    { title: 'Reminder: Update Your Inventory', content: 'Please keep your product listings up to date. Nonprofits rely on accurate availability information when planning their pickups.', groupType: 'SUPPLIER' },
    { title: 'Platform Maintenance Scheduled', content: 'We will be performing scheduled maintenance this Sunday from 2–4 AM EST. The platform may be briefly unavailable during this window.', groupType: 'ALL' },
    { title: 'New Nonprofit Approvals', content: 'Five new nonprofits have been approved this week. Suppliers, expect increased interest in your listings.', groupType: 'ADMIN' },
  ];

  await Promise.all(announcements.map(a =>
    prisma.announcement.create({
      data: { ...a, createdBy: adminUser?.id ?? null },
    })
  ));

  console.log(`Created ${announcements.length} announcements`);
}

export const seedDiscussions = async (prisma, users) => {
  const existing = await prisma.thread.count();
  if (existing > 0) {
    console.log(`Discussions already seeded (${existing} found), skipping...`);
    return;
  }
  console.log('Seeding discussions...');

  const threads = [
    {
      title: 'Best practices for cold storage pickups?',
      content: 'We\'ve been having trouble coordinating refrigerated item pickups. Would love to hear how other nonprofits handle same-day cold storage logistics.',
      groupType: 'NONPROFIT',
      comments: [
        'We always call ahead 30 minutes before arrival — makes a big difference.',
        'We bring our own coolers just in case the supplier\'s cold storage is full.',
      ],
    },
    {
      title: 'How do you handle surplus over your listed quantity?',
      content: 'Sometimes we end up with more product than originally listed. Is there a way to update quantity after posting, or should we create a new listing?',
      groupType: 'SUPPLIER',
      comments: [
        'We just edit the existing listing directly — seems to work fine.',
        'I always create a new listing for clarity so nonprofits see it as fresh availability.',
      ],
    },
    {
      title: 'Coordinating multi-stop pickup routes',
      content: 'Our team does pickups from multiple suppliers in one trip. Any tips for scheduling across different pickup windows on the same day?',
      groupType: 'ALL',
      comments: [
        'We map all the pickup locations first and cluster by area to minimize drive time.',
        'Morning windows tend to be the most flexible — we try to schedule those first.',
        'Highly recommend confirming the day before. Saved us a wasted trip more than once.',
      ],
    },
    {
      title: 'Feedback on the new platform',
      content: 'Now that we\'ve been using the platform for a few weeks, what features would you like to see added or improved?',
      groupType: 'ALL',
      comments: [
        'A notification when a product I\'m interested in becomes available would be huge.',
        'Would love a calendar view for upcoming pickups.',
      ],
    },
    {
      title: 'Protein donations — handling and safety reminders',
      content: 'As we head into warmer months, a reminder to review your cold chain procedures for protein items. Happy to share our internal checklist if useful.',
      groupType: 'NONPROFIT',
      comments: [
        'Please share! We\'ve been looking for a template.',
        'We follow the ServSafe guidelines — works well for our volunteers.',
      ],
    },
  ];

  for (const t of threads) {
    const author = pick(users);
    const thread = await prisma.thread.create({
      data: {
        title: t.title,
        content: t.content,
        groupType: t.groupType,
        createdBy: author?.id ?? null,
      },
    });

    await Promise.all(t.comments.map(content =>
      prisma.comment.create({
        data: {
          content,
          threadId: thread.id,
          createdBy: pick(users)?.id ?? null,
        },
      })
    ));
  }

  console.log(`Created ${threads.length} discussion threads with comments`);
}

export const seedNonprofitUsers = async (prisma, nonprofits, productInterests) => {
  const existing = await prisma.user.count({ where: { role: 'NONPROFIT' } });
  if (existing >= nonprofits.length) {
    console.log(`Nonprofit users already seeded (${existing} found), skipping...`);
    return await prisma.user.findMany({ where: { role: 'NONPROFIT' } });
  }
  console.log('Seeding nonprofit users...');

  const createdUsers = await Promise.all(nonprofits.map((nonprofit, i) =>
    prisma.user.create({
      data: {
        name: `${nonprofit.name} Coordinator`,
        email: `nonprofit${i + 1}@${nonprofit.name.toLowerCase().replace(/\s+/g, '')}.org`,
        role: 'NONPROFIT',
        nonprofitId: nonprofit.id,
        productSurveyId: productInterests[i].id,
        phoneNumber: `404555${String(2000 + i).padStart(4, '0')}`,
      },
    })
  ));

  console.log(`Created ${createdUsers.length} nonprofit users`);
  return createdUsers;
}