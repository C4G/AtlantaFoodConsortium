import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { UserRole } from '../../../../../types/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;
    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
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

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error getting single thread:', error);
    return NextResponse.json(
      { error: 'Failed to get single thread' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const thread = await prisma.thread.findFirst({
      where: { id: threadId, deletedAt: null },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    const isAdmin =
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.STAFF;

    const isAuthor = session.user.id === thread.createdBy;

    if (!isAuthor || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedThread = await prisma.thread.update({
      where: { id: threadId },
      data: { title, content, updatedAt: new Date() },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Error updating thread', error);

    if (error instanceof Error && error.message === 'Thread not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to update thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    const thread = await prisma.thread.findFirst({
      where: { id: threadId, deletedAt: null },
    });

    if (!thread) {
      throw new Error('Thread not found or already deleted');
    }

    const isAdmin =
      session.user.role === UserRole.ADMIN ||
      session.user.role === UserRole.STAFF;

    const isAuthor = session.user.id === thread.createdBy;

    if (!isAuthor || !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.thread.update({
      where: { id: threadId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread', error);

    if (
      error instanceof Error &&
      error.message === 'Thread not found or already deleted'
    ) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}
