/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isValidGroupType } from '@/lib/validation';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    announcement: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  isValidGroupType: vi.fn(),
}));

describe('/api/admin-announcements/[id] - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1');
    const response = await GET(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if announcement is not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'STAFF' },
    } as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1');
    const response = await GET(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Announcement not found' });
  });

  it('should return single announcement for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const announcement = {
      id: 'a-1',
      title: 'Update',
      content: 'Details',
      author: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    };
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(announcement as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1');
    const response = await GET(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(announcement);
    expect(prisma.announcement.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'a-1',
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
  });

  it('should return 500 when fetch throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'STAFF' },
    } as any);
    vi.mocked(prisma.announcement.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1');
    const response = await GET(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching announcement' });
  });
});

describe('/api/admin-announcements/[id] - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isValidGroupType).mockReset();
    vi.mocked(isValidGroupType).mockImplementation(() => true as any);
  });

  it('should return 401 when user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'STAFF' },
    } as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New title' }),
    });
    const response = await PATCH(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when groupType is invalid', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(isValidGroupType).mockImplementationOnce(() => {
      throw new Error('Invalid groupType');
    });

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'PATCH',
      body: JSON.stringify({ groupType: 'BAD_GROUP' }),
    });
    const response = await PATCH(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid groupType' });
  });

  it('should return 404 when post is not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'New title' }),
    });
    const response = await PATCH(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No Posts Found' });
  });

  it('should update announcement for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue({ id: 'a-1' } as any);

    const updated = {
      id: 'a-1',
      title: 'Updated',
      content: 'Updated content',
      groupType: 'ALL',
      author: { id: 'admin-1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' },
    };
    vi.mocked(prisma.announcement.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'PATCH',
      body: JSON.stringify({
        title: 'Updated',
        content: 'Updated content',
        groupType: 'ALL',
      }),
    });
    const response = await PATCH(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.announcement.update).toHaveBeenCalledWith({
      where: { id: 'a-1', deletedAt: null },
      data: {
        title: 'Updated',
        content: 'Updated content',
        groupType: 'ALL',
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

  it('should return 500 when update throws unexpected error', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue({ id: 'a-1' } as any);
    vi.mocked(prisma.announcement.update).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
    });
    const response = await PATCH(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating announcement post' });
  });
});

describe('/api/admin-announcements/[id] - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 when post is missing or already deleted', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Announcement not found or already deleted' });
  });

  it('should soft delete announcement for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue({
      id: 'a-1',
      deletedAt: null,
    } as any);
    vi.mocked(prisma.announcement.update).mockResolvedValue({ id: 'a-1' } as any);

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Announcement post removed successfully' });
    expect(prisma.announcement.update).toHaveBeenCalledWith({
      where: { id: 'a-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should return 500 when delete throws unexpected error', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.announcement.findFirst).mockResolvedValue({
      id: 'a-1',
      deletedAt: null,
    } as any);
    vi.mocked(prisma.announcement.update).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/admin-announcements/a-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, { params: Promise.resolve({ id: 'a-1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Error deleting announcement post:');
  });
});
