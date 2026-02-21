const seedAnnouncements = async (prisma, adminUser) => {
  const existing = await prisma.announcement.count();
  if (existing > 0) {
    console.log(`Announcements already seeded (${existing} found), skipping...`);
    return;
  }
  console.log('Seeding announcements...');

  const announcements = [
    {
      title: 'Welcome to Atlanta Food Consortium!',
      content: 'We are excited to launch our new platform connecting food suppliers with nonprofits across the Atlanta area. Get started by completing your profile.',
      groupType: 'ALL',
    },
    {
      title: 'New Pickup Windows Available',
      content: "Several suppliers have added new morning pickup windows. Check the product listings to see what's newly available in your area.",
      groupType: 'NONPROFIT',
    },
    {
      title: 'Reminder: Update Your Inventory',
      content: 'Please keep your product listings up to date. Nonprofits rely on accurate availability information when planning their pickups.',
      groupType: 'SUPPLIER',
    },
    {
      title: 'Platform Maintenance Scheduled',
      content: 'We will be performing scheduled maintenance this Sunday from 2–4 AM EST. The platform may be briefly unavailable during this window.',
      groupType: 'ALL',
    },
    {
      title: 'New Nonprofit Approvals',
      content: 'Five new nonprofits have been approved this week. Suppliers, expect increased interest in your listings.',
      groupType: 'ADMIN',
    },
  ];

  await Promise.all(announcements.map(a =>
    prisma.announcement.create({
      data: { ...a, createdBy: adminUser?.id ?? null },
    })
  ));

  console.log(`Created ${announcements.length} announcements`);
};

export { seedAnnouncements };
