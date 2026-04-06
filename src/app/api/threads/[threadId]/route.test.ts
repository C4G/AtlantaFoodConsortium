/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    thread: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/threads/[threadId] - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1');
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if thread is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/threads/thread-1');
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Thread not found' });
  });

  it('should return thread for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const thread = {
      id: 'thread-1',
      title: 'Question',
      content: 'Content',
      author: { id: 'user-1', name: 'User', email: 'user@test.com', role: 'SUPPLIER' },
    };
    vi.mocked(prisma.thread.findFirst).mockResolvedValue(thread as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1');
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(thread);
    expect(prisma.thread.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'thread-1',
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

  it('should return 500 when fetch fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/threads/thread-1');
    const response = await GET(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to get single thread' });
  });
});

describe('/api/threads/[threadId] - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
    });
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when required fields are missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Only title' }),
    });
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing fields' });
  });

  it('should return 404 when thread does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
    });
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Thread not found' });
  });

  it('should return 403 when user fails author/admin permission check', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({
      id: 'thread-1',
      createdBy: 'someone-else',
    } as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
    });
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should update thread when user is both admin/staff and author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({
      id: 'thread-1',
      createdBy: 'admin-1',
    } as any);
    vi.mocked(prisma.thread.update).mockResolvedValue({
      id: 'thread-1',
      title: 'Updated',
      content: 'Updated content',
    } as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated', content: 'Updated content' }),
    });
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('thread-1');
    expect(prisma.thread.update).toHaveBeenCalledWith({
      where: { id: 'thread-1' },
      data: {
        title: 'Updated',
        content: 'Updated content',
        updatedAt: expect.any(Date),
      },
    });
  });
});

describe('/api/threads/[threadId] - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 when thread does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Thread not found or already deleted' });
  });

  it('should return 403 when user fails author/admin permission check', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({
      id: 'thread-1',
      createdBy: 'someone-else',
    } as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should soft delete thread when user is both admin/staff and author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({
      id: 'thread-1',
      createdBy: 'staff-1',
    } as any);
    vi.mocked(prisma.thread.update).mockResolvedValue({ id: 'thread-1' } as any);

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Thread deleted successfully' });
    expect(prisma.thread.update).toHaveBeenCalledWith({
      where: { id: 'thread-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should return 500 when delete throws unexpected error', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'staff-1', role: 'STAFF' },
    } as any);
    vi.mocked(prisma.thread.findFirst).mockResolvedValue({
      id: 'thread-1',
      createdBy: 'staff-1',
    } as any);
    vi.mocked(prisma.thread.update).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/threads/thread-1', {
      method: 'DELETE',
    });
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete thread' });
  });
});
