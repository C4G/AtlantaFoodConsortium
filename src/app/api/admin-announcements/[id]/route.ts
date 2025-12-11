import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidGroupType } from '@/lib/validation';
import { NextResponse } from 'next/server';
import { UserRole } from '../../../../../types/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: {
        id,
        deletedAt: null,
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

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Error fetching announcement' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json();
    const { title, content, groupType } = body;

    if (groupType) isValidGroupType(groupType);

    const existing = await prisma.announcement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new Error('No Posts Found');
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        title,
        content,
        groupType,
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

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement post:', error);

    if (error instanceof Error && error.message === 'Invalid groupType') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'No Posts Found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Error updating announcement post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!announcement || announcement.deletedAt) {
      throw new Error('Announcement not found or already deleted');
    }

    await prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: 'Announcement post removed successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting announcement:', error);

    if (
      error instanceof Error &&
      error.message === 'Announcement not found or already deleted'
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: `Error deleting announcement post: ${error}` },
      { status: 500 }
    );
  }
}
