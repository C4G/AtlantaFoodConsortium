/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    thread: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  isValidGroupType: vi.fn(),
}));

describe('/api/threads - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads?page=0&limit=10');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return paginated threads for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const threads = [
      {
        id: 'thread-1',
        title: 'Question about pickup',
        content: 'Can we reschedule?',
        _count: { comments: 2 },
      },
    ];
    vi.mocked(prisma.thread.findMany).mockResolvedValue(threads as any);
    vi.mocked(prisma.thread.count).mockResolvedValue(1);

    const req = new NextRequest('http://localhost/api/threads?page=1&limit=5');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
      threads,
    });
    expect(prisma.thread.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      skip: 5,
      take: 5,
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
  });
});

describe('/api/threads - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Title',
        content: 'Body',
        groupType: 'ALL',
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create thread for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const payload = {
      title: 'Food pickup times',
      content: 'What are pickup windows?',
      groupType: 'ALL',
    };
    const created = {
      id: 'thread-1',
      ...payload,
      createdBy: 'user-1',
      author: { id: 'user-1', name: 'User', email: 'user@test.com', role: 'NONPROFIT' },
    };
    vi.mocked(prisma.thread.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(created);
    expect(prisma.thread.create).toHaveBeenCalledWith({
      data: {
        title: payload.title,
        content: payload.content,
        groupType: payload.groupType,
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

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.thread.create).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/threads', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Food pickup times',
        content: 'What are pickup windows?',
        groupType: 'ALL',
      }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create thread' });
  });
});
