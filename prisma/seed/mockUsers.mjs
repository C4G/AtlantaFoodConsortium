const seedSupplierUsers = async (prisma, suppliers) => {
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
};

const seedNonprofitUsers = async (prisma, nonprofits, productInterests) => {
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
};

export { seedSupplierUsers, seedNonprofitUsers };
