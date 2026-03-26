/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    comment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/threads/[threadId]/comments/[commentId] - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated comment' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 when content is empty', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: '   ' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Content cannot be empty' });
  });

  it('should return 404 when comment does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated comment' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Comment not found' });
  });

  it('should return 403 when user is neither admin/staff nor author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated comment' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should update comment for author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);

    const updated = {
      id: 'comment-1',
      content: 'Updated comment',
      author: { id: 'user-1', name: 'User', email: 'user@test.com', role: 'NONPROFIT' },
    };
    vi.mocked(prisma.comment.update).mockResolvedValue(updated as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated comment' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
      data: {
        content: 'Updated comment',
        updatedAt: expect.any(Date),
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

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);
    vi.mocked(prisma.comment.update).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated comment' }),
      }
    );
    const response = await PATCH(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to update comment' });
  });
});

describe('/api/threads/[threadId]/comments/[commentId] - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'DELETE',
      }
    );
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 when comment does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'DELETE',
      }
    );
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Comment not found' });
  });

  it('should return 403 when user is neither admin/staff nor author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'SUPPLIER' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'DELETE',
      }
    );
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Forbidden' });
  });

  it('should soft delete comment for author', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);
    vi.mocked(prisma.comment.update).mockResolvedValue({ id: 'comment-1' } as any);

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'DELETE',
      }
    );
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Comment deleted successfully' });
    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.comment.findFirst).mockResolvedValue({
      id: 'comment-1',
      createdBy: 'user-1',
    } as any);
    vi.mocked(prisma.comment.update).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest(
      'http://localhost/api/threads/thread-1/comments/comment-1',
      {
        method: 'DELETE',
      }
    );
    const response = await DELETE(req, {
      params: Promise.resolve({ threadId: 'thread-1', commentId: 'comment-1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to delete comment' });
  });
});
