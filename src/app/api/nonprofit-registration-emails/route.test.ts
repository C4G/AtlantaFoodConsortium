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

// React.createElement is used directly for the email template — no render() call needed
vi.mock('@/emails/NonprofitRegistrationNotification', () => ({
  default: vi.fn(() => null),
}));

const adminUsers = [
  {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin One',
    role: 'ADMIN',
  },
  {
    id: 'admin-2',
    email: 'admin2@example.com',
    name: 'Admin Two',
    role: 'ADMIN',
  },
];

const validPayload = {
  nonprofitName: 'Atlanta Food Bank',
  organizationType: 'Nonprofit',
  nonprofitEmail: 'contact@foodbank.org',
  nonprofitPhone: '404-555-0100',
  nonprofitWebsite: 'https://foodbank.org',
};

describe('POST /api/nonprofit-registration-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      { method: 'POST', body: JSON.stringify(validPayload) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 400 if nonprofitName is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, nonprofitName: undefined }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/i);
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 400 if organizationType is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, organizationType: undefined }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/i);
  });

  it('should return 400 if nonprofitEmail is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      {
        method: 'POST',
        body: JSON.stringify({ ...validPayload, nonprofitEmail: undefined }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/i);
  });

  it('should return 400 if nonprofitEmail has invalid format', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      {
        method: 'POST',
        body: JSON.stringify({
          ...validPayload,
          nonprofitEmail: 'not-an-email',
        }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid email format' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if no admin users exist', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      { method: 'POST', body: JSON.stringify(validPayload) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No admin users found in the system' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should send emails to all admin users and return success', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(adminUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      { method: 'POST', body: JSON.stringify(validPayload) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe(
      `Notification sent to ${adminUsers.length} admin users`
    );

    // Verify the batch email was sent with one request per admin
    expect(resend.batch.send).toHaveBeenCalledOnce();
    const [emailRequests] = vi.mocked(resend.batch.send).mock.calls[0];
    expect(emailRequests).toHaveLength(adminUsers.length);
    expect(emailRequests[0].to).toBe('admin@example.com');
    expect(emailRequests[0].subject).toContain(validPayload.nonprofitName);
    expect(emailRequests[0].from).toContain('mafc-no-reply@c4g.dev');
    expect(emailRequests[1].to).toBe('admin2@example.com');
  });

  it('should query only ADMIN role users', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(adminUsers as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      { method: 'POST', body: JSON.stringify(validPayload) }
    );
    await POST(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN' },
    });
  });

  it('should return 500 when resend throws', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(adminUsers as any);
    vi.mocked(resend.batch.send).mockRejectedValue(new Error('resend failure'));

    const req = new NextRequest(
      'http://localhost/api/nonprofit-registration-emails',
      { method: 'POST', body: JSON.stringify(validPayload) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to send nonprofit registration email',
    });
  });
});
