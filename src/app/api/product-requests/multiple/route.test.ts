/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/product-requests/multiple - GET', () => {
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

  it('should return all product requests for SUPPLIER', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const productRequests = [
      {
        id: 'pr-1',
        supplierId: 'sup-1',
        productType: { id: 'pt-1' },
      },
    ];
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue(
      productRequests as any
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(productRequests);
    expect(prisma.productRequest.findMany).toHaveBeenCalledWith({
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('db failure')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching product requests' });
  });
});

describe('/api/product-requests/multiple - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authorized', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'nonprofit-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-requests/multiple', {
      method: 'POST',
      body: JSON.stringify([]),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create multiple product requests for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = [
      { supplierId: 'sup-1', productTypeId: 'pt-1', quantity: 10 },
      { supplierId: 'sup-1', productTypeId: 'pt-2', quantity: 20 },
    ];

    const created = [
      { id: 'pr-1', ...payload[0] },
      { id: 'pr-2', ...payload[1] },
    ];

    vi.mocked(prisma.productRequest.create)
      .mockReturnValueOnce({ id: 'tx-op-1' } as any)
      .mockReturnValueOnce({ id: 'tx-op-2' } as any);
    vi.mocked(prisma.$transaction).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/product-requests/multiple', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.productRequest.create).toHaveBeenCalledTimes(2);
    expect(prisma.productRequest.create).toHaveBeenNthCalledWith(1, {
      data: payload[0],
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
    expect(prisma.productRequest.create).toHaveBeenNthCalledWith(2, {
      data: payload[1],
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('should return 500 when transaction fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const payload = [{ supplierId: 'sup-1', productTypeId: 'pt-1', quantity: 10 }];

    vi.mocked(prisma.productRequest.create).mockReturnValue({ id: 'tx-op-1' } as any);
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error('db failure'));

    const req = new NextRequest('http://localhost/api/product-requests/multiple', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating products' });
  });
});
