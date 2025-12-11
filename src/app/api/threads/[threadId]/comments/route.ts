import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { searchParams } = new URL(req.url);
  let page = parseInt(searchParams.get('page') || '0', 10);
  if (isNaN(page) || page < 0) {
    page = 0;
  }

  const MAX_LIMIT = 100;
  let limit = parseInt(searchParams.get('limit') || '10', 10);
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  // to calculate how many records to skip in db
  const skip = page * limit;

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
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        threadId,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'asc' }],
      skip,
      take: limit,
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

    const total = await prisma.comment.count({
      where: {
        threadId,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const thread = await prisma.thread.findFirst({
      where: {
        id: threadId,
        deletedAt: null,
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        threadId,
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
