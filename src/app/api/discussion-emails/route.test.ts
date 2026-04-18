/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { resend } from '@/lib/resend';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    thread: {
      findUnique: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/resend', () => ({
  resend: {
    batch: {
      send: vi.fn(),
    },
  },
}));

vi.mock('@/emails/NewThreadNotification', () => ({
  default: vi.fn(() => null),
}));

const userSession = { user: { id: 'user-1', role: 'SUPPLIER' } };

const mockThread = {
  id: 'thread-1',
  title: 'Best practices for cold storage pickups?',
  content: "We've been having trouble coordinating refrigerated item pickups.",
  groupType: 'NONPROFIT',
  author: { name: 'Supplier Jane' },
};

const mockUsers = [
  { email: 'nonprofit1@test.com', name: 'Nonprofit One' },
  { email: 'nonprofit2@test.com', name: 'Nonprofit Two' },
];

describe('POST /api/discussion-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 401 if session has no user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: null } as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 400 if threadId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Thread ID is required' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if thread is not found', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'missing-id' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Thread not found' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return success with sent:0 when no users match', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(mockThread as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, sent: 0 });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should send batch emails to matched users and return success', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(mockThread as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, sent: 2 });
    expect(resend.batch.send).toHaveBeenCalledOnce();

    const [emailRequests] = vi.mocked(resend.batch.send).mock.calls[0];
    expect(emailRequests).toHaveLength(2);
    expect(emailRequests[0].to).toBe('nonprofit1@test.com');
    expect(emailRequests[1].to).toBe('nonprofit2@test.com');
    expect(emailRequests[0].subject).toContain(mockThread.title);
    expect(emailRequests[0].from).toContain('mafc-no-reply@c4g.dev');
  });

  it('should query only the target role for non-ALL groupTypes', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(mockThread as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    await POST(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'NONPROFIT', discussionEmailOptOut: false },
      select: { email: true, name: true },
    });
  });

  it('should query all users (no role filter) for groupType ALL', async () => {
    const allGroupThread = { ...mockThread, groupType: 'ALL' };
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(
      allGroupThread as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    await POST(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { discussionEmailOptOut: false },
      select: { email: true, name: true },
    });
  });

  it('should fall back to "Community Member" when thread has no author', async () => {
    const threadNoAuthor = { ...mockThread, author: null };
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(
      threadNoAuthor as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockUsers[0]] as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(resend.batch.send).toHaveBeenCalledOnce();
  });

  it('should return 500 when resend.batch.send throws', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockResolvedValue(mockThread as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockRejectedValue(new Error('resend failure'));

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send discussion emails' });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue(userSession as any);
    vi.mocked(prisma.thread.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/discussion-emails', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send discussion emails' });
  });
});
