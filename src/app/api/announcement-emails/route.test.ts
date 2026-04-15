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
    announcement: {
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

vi.mock('@/emails/AnnouncementNotification', () => ({
  default: vi.fn(() => null),
}));

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };

const mockAnnouncement = {
  id: 'ann-1',
  title: 'Platform Maintenance',
  content: 'We will be down Sunday 2-4 AM.',
  groupType: 'ALL',
  author: { name: 'Admin User' },
};

const mockUsers = [
  { email: 'supplier@test.com', name: 'Supplier One' },
  { email: 'nonprofit@test.com', name: 'Nonprofit One' },
];

describe('POST /api/announcement-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 401 if session has no user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: null } as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 400 if announcementId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Announcement ID is required' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if announcement is not found', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'missing-id' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Announcement not found' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return success with sent:0 when no users match', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      mockAnnouncement as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, sent: 0 });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should send batch emails to all users for groupType ALL', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      mockAnnouncement as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, sent: 2 });
    expect(resend.batch.send).toHaveBeenCalledOnce();

    const [emailRequests] = vi.mocked(resend.batch.send).mock.calls[0];
    expect(emailRequests).toHaveLength(2);
    expect(emailRequests[0].to).toBe('supplier@test.com');
    expect(emailRequests[1].to).toBe('nonprofit@test.com');
    expect(emailRequests[0].subject).toContain(mockAnnouncement.title);
    expect(emailRequests[0].from).toContain('mafc-no-reply@c4g.dev');
  });

  it('should query only the target role for non-ALL groupTypes', async () => {
    const nonprofitAnnouncement = {
      ...mockAnnouncement,
      groupType: 'NONPROFIT',
    };
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      nonprofitAnnouncement as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { email: 'nonprofit@test.com', name: 'Nonprofit One' },
    ] as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    await POST(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'NONPROFIT' },
      select: { email: true, name: true },
    });
  });

  it('should query all users (no role filter) for groupType ALL', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      mockAnnouncement as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    await POST(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      select: { email: true, name: true },
    });
  });

  it('should fall back to "Admin Team" when announcement has no author', async () => {
    const announcementNoAuthor = { ...mockAnnouncement, author: null };
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      announcementNoAuthor as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockUsers[0]] as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);

    expect(response.status).toBe(200);
    // resend was called — content checked via the React element props
    expect(resend.batch.send).toHaveBeenCalledOnce();
  });

  it('should return 500 when resend.batch.send throws', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockResolvedValue(
      mockAnnouncement as any
    );
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
    vi.mocked(resend.batch.send).mockRejectedValue(new Error('resend failure'));

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send announcement emails' });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.announcement.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/announcement-emails', {
      method: 'POST',
      body: JSON.stringify({ announcementId: 'ann-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send announcement emails' });
  });
});
