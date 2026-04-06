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
    nonprofit: {
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

vi.mock('@/emails/ProductRequestAvailableNotification', () => ({
  default: vi.fn(() => null),
}));

const supplierSession = { user: { id: 'sup-user-1', role: 'SUPPLIER' } };

const mockPickupInfo = {
  pickupDate: new Date('2026-04-15T08:00:00Z'),
  pickupLocation: '456 Peachtree St, Atlanta, GA',
  pickupTimeframe: ['MORNING'],
  pickupInstructions: 'Ring doorbell on arrival',
};

const mockProductType = {
  id: 'pt-1',
  protein: true,
  produce: false,
  shelfStable: false,
  shelfStableIndividualServing: false,
  alreadyPreparedFood: false,
  other: false,
};

const mockProduct = {
  id: 'prod-1',
  name: 'Chicken Breast',
  quantity: 100,
  unit: 'lbs',
  description: 'Boneless chicken breast',
  supplierId: 'sup-1',
  productType: mockProductType,
  supplier: {
    id: 'sup-1',
    name: 'Fresh Farms',
    users: [
      {
        email: 'contact@freshfarms.com',
        name: 'Jane Supplier',
        phoneNumber: '404-555-0300',
      },
    ],
  },
  pickupInfo: mockPickupInfo,
};

const mockApprovedNonprofit = {
  id: 'np-1',
  name: 'Hope Center',
  nonprofitDocumentApproval: true,
  users: [{ email: 'hope@center.org', name: 'Hope User' }],
};

const mockUnapprovedNonprofit = {
  id: 'np-2',
  name: 'Pending Org',
  nonprofitDocumentApproval: false,
  users: [{ email: 'pending@org.org', name: 'Pending User' }],
};

describe('POST /api/product-availability-emails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Supplier access required' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not SUPPLIER', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized - Supplier access required' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 400 if productId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({}) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product ID is required' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if product is not found', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'missing-prod' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product not found' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if product has no pickup info', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      ...mockProduct,
      pickupInfo: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product pickup information not found' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should return 404 if supplier has no contact user', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      ...mockProduct,
      supplier: { ...mockProduct.supplier, users: [] },
    } as any);
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      mockApprovedNonprofit,
    ] as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Supplier contact information not found' });
    expect(resend.batch.send).not.toHaveBeenCalled();
  });

  it('should send emails to approved nonprofits only and return success', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      mockApprovedNonprofit,
      mockUnapprovedNonprofit,
    ] as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // Only approved nonprofits should receive an email
    expect(resend.batch.send).toHaveBeenCalledOnce();
    const [emailRequests] = vi.mocked(resend.batch.send).mock.calls[0];
    expect(emailRequests).toHaveLength(1);
    expect(emailRequests[0].to).toBe('hope@center.org');
    expect(emailRequests[0].subject).toContain(mockProduct.name);
    expect(emailRequests[0].from).toContain('mafc-no-reply@c4g.dev');
  });

  it('should send no emails when all matching nonprofits are unapproved', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      mockUnapprovedNonprofit,
    ] as any);
    vi.mocked(resend.batch.send).mockResolvedValue({
      data: null,
      error: null,
    } as any);

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });

    // batch.send is still called but with an empty array
    expect(resend.batch.send).toHaveBeenCalledOnce();
    const [emailRequests] = vi.mocked(resend.batch.send).mock.calls[0];
    expect(emailRequests).toHaveLength(0);
  });

  it('should return 500 when resend throws', async () => {
    vi.mocked(auth).mockResolvedValue(supplierSession as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(
      mockProduct as any
    );
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      mockApprovedNonprofit,
    ] as any);
    vi.mocked(resend.batch.send).mockRejectedValue(new Error('resend failure'));

    const req = new NextRequest(
      'http://localhost/api/product-availability-emails',
      { method: 'POST', body: JSON.stringify({ productId: 'prod-1' }) }
    );
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send email' });
  });
});
