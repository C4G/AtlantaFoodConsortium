/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
      findMany: vi.fn(),
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

describe('/api/admin-announcements - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return announcements for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);

    const announcements = [
      { id: 'a-1', title: 'Notice 1', content: 'Content 1', groupType: 'ALL' },
    ];
    vi.mocked(prisma.announcement.findMany).mockResolvedValue(
      announcements as any
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(announcements);
    expect(prisma.announcement.findMany).toHaveBeenCalledWith({
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
  });
});

describe('/api/admin-announcements - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);

    const req = new NextRequest('http://localhost/api/admin-announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Important update',
        content: 'Details',
        groupType: 'ALL',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create announcement for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = {
      title: 'Important update',
      content: 'Details',
      groupType: 'ALL',
    };
    const created = {
      id: 'a-1',
      ...payload,
      createdBy: 'admin-1',
      author: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    };
    vi.mocked(prisma.announcement.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/admin-announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(created);
    expect(prisma.announcement.create).toHaveBeenCalledWith({
      data: {
        title: payload.title,
        content: payload.content,
        groupType: payload.groupType,
        createdBy: 'admin-1',
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
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.create).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/admin-announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Important update',
        content: 'Details',
        groupType: 'ALL',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating announcement post' });
  });
});
