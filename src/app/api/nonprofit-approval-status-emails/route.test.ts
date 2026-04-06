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
    nonprofit: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}));

// render() is called on the email component — mock both
vi.mock('@react-email/render', () => ({
  render: vi.fn().mockResolvedValue('<html>email</html>'),
}));

vi.mock('@/emails/NonprofitRegistrationStatusNotification', () => ({
  default: vi.fn(() => null),
}));

const adminSession = { user: { id: 'admin-1', role: 'ADMIN' } };

const mockNonprofit = {
  id: 'np-1',
  name: 'Atlanta Food Bank',
  users: [{ email: 'user1@foodbank.org' }, { email: 'user2@foodbank.org' }],
};

const mockAdminUser = {
  id: 'admin-1',
  email: 'admin@mafc.org',
  name: 'Admin User',
};

describe('POST /api/nonprofit-approval-status-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 400 if nonprofitId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Nonprofit ID and approval status are required',
    });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 400 if approved is missing', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1' }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Nonprofit ID and approval status are required',
    });
  });

  it('should return 404 if nonprofit is not found', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-missing', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Nonprofit not found' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 404 if admin user is not found', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(
      mockNonprofit as any
    );
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Admin user not found' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should send approval email and return success', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(
      mockNonprofit as any
    );
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser as any);
    vi.mocked(resend.emails.send).mockResolvedValue({
      data: { id: 'email-1' },
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // Verify email was sent to all nonprofit users
    expect(resend.emails.send).toHaveBeenCalledOnce();
    const sendCall = vi.mocked(resend.emails.send).mock.calls[0][0];
    expect(sendCall.to).toEqual(['user1@foodbank.org', 'user2@foodbank.org']);
    expect(sendCall.subject).toBe('Nonprofit Registration Status Update');
    expect(sendCall.html).toBe('<html>email</html>');
  });

  it('should send rejection email and return success', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(
      mockNonprofit as any
    );
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser as any);
    vi.mocked(resend.emails.send).mockResolvedValue({
      data: { id: 'email-2' },
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: false }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    expect(resend.emails.send).toHaveBeenCalledOnce();
    const sendCall = vi.mocked(resend.emails.send).mock.calls[0][0];
    expect(sendCall.to).toEqual(['user1@foodbank.org', 'user2@foodbank.org']);
    expect(sendCall.subject).toBe('Nonprofit Registration Status Update');
  });

  it('should return 500 when resend throws', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(
      mockNonprofit as any
    );
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockAdminUser as any);
    vi.mocked(resend.emails.send).mockRejectedValue(
      new Error('resend failure')
    );

    const req = new NextRequest(
      'http://localhost/api/nonprofit-approval-status-emails',
      {
        method: 'POST',
        body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
      }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to process nonprofit approval' });
  });
});
