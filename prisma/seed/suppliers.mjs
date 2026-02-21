import { pick } from './helpers.mjs';

const seedSuppliers = async (prisma) => {
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
      create: { name: supplier.name, cadence: supplier.cadence },
    });
    createdSuppliers.push(created);
    console.log(`Created supplier: ${supplier.name}`);
  }

  return createdSuppliers;
};

const seedNonprofits = async (prisma) => {
  const existing = await prisma.nonprofit.count();
  if (existing > 0) {
    console.log(`Nonprofits already seeded (${existing} found), skipping...`);
    return await prisma.nonprofit.findMany();
  }
  console.log('Seeding nonprofits...');

  const orgTypes = ['FOOD_BANK', 'PANTRY', 'STUDENT_PANTRY', 'FOOD_RESCUE', 'AGRICULTURE', 'OTHER'];
  const baseNames = [
    'Community Food Bank', 'Pantry Network', 'Student Pantry', 'Campus Food Collective',
    'Food Rescue Alliance', 'Agriculture Co-op', 'Helping Hands', 'Food Resource Center',
    'Aid Network', 'Community Kitchen', 'Meal Service', 'Food Mission', 'Outreach Center',
    'Relief Organization', 'Charity Foundation', 'Care Center', 'Support Network',
    'Wellness Hub', 'Food Cooperative', 'Distribution Center',
  ];
  const areas = [
    'Atlanta', 'Downtown', 'Midtown', 'Buckhead', 'East Point', 'College Park',
    'Decatur', 'Sandy Springs', 'Marietta', 'Roswell', 'Alpharetta', 'Duluth',
    'Northside', 'Southside', 'Eastside', 'Westside', 'Metro', 'Greater Atlanta',
    'GSU', 'Emory', 'KSU', 'Georgia Tech', 'Spelman', 'Morehouse', 'Clark Atlanta',
  ];

  const createdNonprofits = [];
  for (let i = 0; i < 40; i++) {
    const name = `${areas[i % areas.length]} ${pick(baseNames)}${i > 25 ? ` ${String.fromCharCode(65 + (i % 26))}` : ''}`;
    const rand = Math.random();
    const approved = rand < 0.7 ? true : rand < 0.9 ? null : false;

    const document = await prisma.nonprofitDocument.create({
      data: {
        fileName: `${name.replace(/\s+/g, '_')}_501c3.pdf`,
        fileData: Buffer.from('Mock PDF data'),
        fileType: 'application/pdf',
      },
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
};

export { seedSuppliers, seedNonprofits };
