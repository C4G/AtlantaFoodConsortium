import { NextResponse } from 'next/server';
import React from 'react';
import AnnouncementNotification from '@/emails/AnnouncementNotification';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { GroupType } from '@/generated/prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { announcementId } = await req.json();

    if (!announcementId) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Build role filter based on groupType
    const roleFilter =
      announcement.groupType === GroupType.ALL
        ? {}
        : {
            role: announcement.groupType as unknown as typeof announcement.groupType,
          };

    const users = await prisma.user.findMany({
      where: roleFilter,
      select: { email: true, name: true },
    });

    console.log('Sending announcement emails:', {
      announcementId,
      title: announcement.title,
      groupType: announcement.groupType,
      recipientCount: users.length,
    });

    if (users.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const authorName = announcement.author?.name ?? 'Admin Team';

    const emailRequests = users.map((user) => ({
      from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
      to: user.email,
      subject: `Announcement: ${announcement.title}`,
      react: React.createElement(AnnouncementNotification, {
        recipientName: user.name ?? 'Valued Member',
        title: announcement.title,
        content: announcement.content,
        authorName,
      }),
    }));

    await resend.batch.send(emailRequests, { batchValidation: 'permissive' });

    return NextResponse.json({ success: true, sent: emailRequests.length });
  } catch (error) {
    console.error('Error sending announcement emails:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to send announcement emails' },
      { status: 500 }
    );
  }
}
