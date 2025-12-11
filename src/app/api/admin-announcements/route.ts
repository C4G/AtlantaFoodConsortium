import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidGroupType } from '@/lib/validation';
import { NextResponse } from 'next/server';
import { UserRole } from '../../../../types/types';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcements = await prisma.announcement.findMany({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error listing announcements:', error);
    return NextResponse.json(
      { error: 'Error listing announcements:' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, groupType } = body;
    if (title === '' || content === '' || !groupType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (groupType) isValidGroupType(groupType);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        groupType,
        createdBy: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating announcement post:', error);

    if (error instanceof Error && error.message === 'Invalid groupType') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error creating announcement post' },
      { status: 500 }
    );
  }
}
