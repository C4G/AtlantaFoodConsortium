import { pick } from './helpers.mjs';

const seedDiscussions = async (prisma, users) => {
  const existing = await prisma.thread.count();
  if (existing > 0) {
    console.log(`Discussions already seeded (${existing} found), skipping...`);
    return;
  }
  console.log('Seeding discussions...');

  const threads = [
    {
      title: 'Best practices for cold storage pickups?',
      content: "We've been having trouble coordinating refrigerated item pickups. Would love to hear how other nonprofits handle same-day cold storage logistics.",
      groupType: 'NONPROFIT',
      comments: [
        'We always call ahead 30 minutes before arrival — makes a big difference.',
        "We bring our own coolers just in case the supplier's cold storage is full.",
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
      content: "Now that we've been using the platform for a few weeks, what features would you like to see added or improved?",
      groupType: 'ALL',
      comments: [
        "A notification when a product I'm interested in becomes available would be huge.",
        'Would love a calendar view for upcoming pickups.',
      ],
    },
    {
      title: 'Protein donations — handling and safety reminders',
      content: 'As we head into warmer months, a reminder to review your cold chain procedures for protein items. Happy to share our internal checklist if useful.',
      groupType: 'NONPROFIT',
      comments: [
        "Please share! We've been looking for a template.",
        'We follow the ServSafe guidelines — works well for our volunteers.',
      ],
    },
  ];

  for (const t of threads) {
    const thread = await prisma.thread.create({
      data: {
        title: t.title,
        content: t.content,
        groupType: t.groupType,
        createdBy: pick(users)?.id ?? null,
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
};

export { seedDiscussions };
