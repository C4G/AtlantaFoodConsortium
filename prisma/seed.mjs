import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed/users.mjs';
import { seedSuppliers, seedNonprofits } from './seed/suppliers.mjs';
import { seedProductRequests, seedProductInterests } from './seed/products.mjs';
import { seedSupplierUsers, seedNonprofitUsers } from './seed/mockUsers.mjs';
import { seedAnnouncements } from './seed/announcements.mjs';
import { seedDiscussions } from './seed/discussions.mjs';

const prisma = new PrismaClient();

const main = async () => {
  console.log('----- Starting to seed initial data -----');
  await seedUsers(prisma);

  console.log('----- Seeding suppliers and nonprofits -----');
  const suppliers = await seedSuppliers(prisma);
  const nonprofits = await seedNonprofits(prisma);

  console.log('----- Seeding product interests -----');
  const productInterests = await seedProductInterests(prisma, nonprofits);

  console.log('----- Seeding supplier and nonprofit users -----');
  await seedSupplierUsers(prisma, suppliers);
  await seedNonprofitUsers(prisma, nonprofits, productInterests);

  console.log('----- Seeding product requests -----');
  await seedProductRequests(prisma, suppliers, nonprofits);

  console.log('----- Seeding announcements and discussions -----');
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const allUsers = await prisma.user.findMany({ where: { role: { in: ['SUPPLIER', 'NONPROFIT'] } } });
  await seedAnnouncements(prisma, adminUser);
  await seedDiscussions(prisma, allUsers);

  console.log('----- Seed process completed successfully! -----');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
