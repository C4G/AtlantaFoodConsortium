import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { announcementEmailOptOut: true, discussionEmailOptOut: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    announcementEmailOptOut: user.announcementEmailOptOut,
    discussionEmailOptOut: user.discussionEmailOptOut,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { announcementEmailOptOut, discussionEmailOptOut } = body;

  if (
    typeof announcementEmailOptOut !== 'boolean' ||
    typeof discussionEmailOptOut !== 'boolean'
  ) {
    return NextResponse.json(
      {
        error:
          'announcementEmailOptOut and discussionEmailOptOut must be booleans',
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { announcementEmailOptOut, discussionEmailOptOut },
    select: { announcementEmailOptOut: true, discussionEmailOptOut: true },
  });

  return NextResponse.json({
    announcementEmailOptOut: user.announcementEmailOptOut,
    discussionEmailOptOut: user.discussionEmailOptOut,
  });
}
