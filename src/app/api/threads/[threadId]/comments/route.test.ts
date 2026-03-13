/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    thread: {
      findFirst: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/threads/[threadId]/comments - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1/comments');
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return paginated comments for existing thread', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({ id: 'thread-1' } as any);

    const comments = [
      { id: 'comment-1', content: 'Thanks for the update' },
      { id: 'comment-2', content: 'We can pick up Tuesday' },
    ];
    vi.mocked(prisma.comment.findMany).mockResolvedValue(comments as any);
    vi.mocked(prisma.comment.count).mockResolvedValue(2);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments?page=0&limit=2'
    );
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      page: 0,
      limit: 2,
      total: 2,
      totalPages: 1,
      comments,
    });
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: {
        threadId: 'thread-1',
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'asc' }],
      skip: 0,
      take: 2,
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
  });
});

describe('/api/threads/[threadId]/comments - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1/comments', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello world' }),
    });
    const response = await POST(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create comment for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({ id: 'thread-1' } as any);

    const created = {
      id: 'comment-1',
      content: 'Hello world',
      threadId: 'thread-1',
      createdBy: 'user-1',
      author: { id: 'user-1', name: 'User', email: 'user@test.com', role: 'NONPROFIT' },
    };
    vi.mocked(prisma.comment.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1/comments', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello world' }),
    });
    const response = await POST(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(created);
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        content: 'Hello world',
        threadId: 'thread-1',
        createdBy: 'user-1',
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
  });

  it('should return 500 when comment create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({ id: 'thread-1' } as any);
    vi.mocked(prisma.comment.create).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/threads/thread-1/comments', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello world' }),
    });
    const response = await POST(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create comment' });
  });
});
