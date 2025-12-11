import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidGroupType } from '@/lib/validation';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
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

    const threads = await prisma.thread.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [
        { createdAt: 'desc' }, // this will be the primary sort
        { updatedAt: 'desc' },
      ],
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
        _count: { select: { comments: true } },
      },
    });

    const total = await prisma.thread.count({
      where: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      threads,
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, groupType } = await req.json();

    if (!title || !content || !groupType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (groupType) isValidGroupType(groupType);

    const thread = await prisma.thread.create({
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

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}
