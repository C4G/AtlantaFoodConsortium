import { NextResponse } from 'next/server';
import React from 'react';
import NewThreadNotification from '@/emails/NewThreadNotification';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { GroupType } from '../../../../types/types';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await req.json();

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { name: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Build role filter based on groupType; exclude users who opted out of emails
    const roleFilter =
      thread.groupType === GroupType.ALL ? {} : { role: thread.groupType };

    const users = await prisma.user.findMany({
      where: { ...roleFilter, discussionEmailOptOut: false },
      select: { email: true, name: true },
    });

    console.log('Sending discussion thread emails:', {
      threadId,
      title: thread.title,
      groupType: thread.groupType,
      recipientCount: users.length,
    });

    if (users.length === 0) {
      return NextResponse.json({ success: true, sent: 0 });
    }

    const authorName = thread.author?.name ?? 'Community Member';
    const settingsUrl = `${new URL(req.url).origin}/settings`;

    const emailRequests = users.map((user) => ({
      from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
      to: user.email,
      subject: `New Discussion: ${thread.title}`,
      react: React.createElement(NewThreadNotification, {
        recipientName: user.name ?? 'Valued Member',
        threadTitle: thread.title,
        threadContent: thread.content,
        authorName,
        groupType: thread.groupType,
        settingsUrl,
      }),
    }));

    await resend.batch.send(emailRequests, { batchValidation: 'permissive' });

    return NextResponse.json({ success: true, sent: emailRequests.length });
  } catch (error) {
    console.error('Error sending discussion thread emails:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to send discussion emails' },
      { status: 500 }
    );
  }
}
