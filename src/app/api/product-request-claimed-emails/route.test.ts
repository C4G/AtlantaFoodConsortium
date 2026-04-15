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
    productRequest: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
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

vi.mock('@/emails/ProductRequestClaimedNotification', () => ({
  default: vi.fn(() => null),
}));

const nonprofitSession = { user: { id: 'np-user-1', role: 'NONPROFIT' } };

const mockPickupInfo = {
  pickupDate: new Date('2026-04-01T10:00:00Z'),
  pickupLocation: '123 Main St, Atlanta, GA',
  pickupTimeframe: ['MORNING'],
  pickupInstructions: 'Use the back entrance',
};

const mockProduct = {
  id: 'prod-1',
  name: 'Canned Goods',
  quantity: 50,
  unit: 'cans',
  description: 'Assorted canned vegetables',
  supplierId: 'sup-1',
  productType: { id: 'pt-1', name: 'Shelf Stable' },
  supplier: { id: 'sup-1', name: 'Atlanta Grocers' },
  pickupInfo: mockPickupInfo,
  claimingNonprofit: { id: 'np-1', name: 'Atlanta Food Bank' },
};

const mockSupplierUser = {
  id: 'sup-user-1',
  email: 'supplier@grocers.com',
  phoneNumber: '404-555-0200',
};

describe('POST /api/product-request-claimed-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Nonprofit access required' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not NONPROFIT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Nonprofit access required' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 400 if productId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({}) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Missing required field: productId is required',
    });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 404 if product is not found', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'missing-prod' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product not found' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 404 if product has no pickup info', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      ...mockProduct,
      pickupInfo: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product pickup information not found' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 400 if product has not been claimed', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      ...mockProduct,
      claimingNonprofit: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product has not been claimed' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should return 404 if supplier user is not found', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Supplier user not found' });
    expect(resend.emails.send).not.toHaveBeenCalled();
  });

  it('should send email to supplier and return success', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockSupplierUser as any);
    vi.mocked(resend.emails.send).mockResolvedValue({
      data: { id: 'email-1' },
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify the email was sent to the supplier
    expect(resend.emails.send).toHaveBeenCalledOnce();
    const sendCall = vi.mocked(resend.emails.send).mock.calls[0][0];
    expect(sendCall.to).toBe('supplier@grocers.com');
    expect(sendCall.subject).toBe(`Product Claimed: ${mockProduct.name}`);
    expect(sendCall.from).toContain('mafc-no-reply@c4g.dev');
  });

  it('should look up supplier user by supplierId', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockSupplierUser as any);
    vi.mocked(resend.emails.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    await POST(req);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { supplierId: mockProduct.supplierId },
    });
  });

  it('should return 500 when resend throws', async () => {
    vi.mocked(auth).mockResolvedValue(nonprofitSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockSupplierUser as any);
    vi.mocked(resend.emails.send).mockRejectedValue(
      new Error('resend failure')
    );

    const req = new NextRequest(
      'http://localhost/api/product-request-claimed-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send product claimed email' });
  });
});
