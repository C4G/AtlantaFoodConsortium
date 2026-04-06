/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productRequest: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/item-availability - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not NONPROFIT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/item-availability?status=AVAILABLE'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 for invalid status', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Valid status parameter is required' });
  });

  it('should return available items for NONPROFIT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);

    const items = [
      { id: 'pr-1', status: 'AVAILABLE', productType: {}, supplier: {}, pickupInfo: {} },
    ];
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue(items as any);

    const req = new NextRequest(
      'http://localhost/api/item-availability?status=AVAILABLE'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(items);
    expect(prisma.productRequest.findMany).toHaveBeenCalledWith({
      where: { status: 'AVAILABLE' },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest(
      'http://localhost/api/item-availability?status=AVAILABLE'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching available items' });
  });
});

describe('/api/item-availability - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not NONPROFIT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', action: 'claim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ action: 'claim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product ID is required' });
  });

  it('should claim product for NONPROFIT user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    const updated = {
      id: 'pr-1',
      status: 'RESERVED',
      claimedById: 'nonprofit-1',
      productType: {},
      supplier: {},
      pickupInfo: {},
    };
    vi.mocked(prisma.productRequest.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', action: 'claim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: {
        status: 'RESERVED',
        claimedById: 'nonprofit-1',
      },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
      },
    });
  });

  it('should unclaim product for NONPROFIT user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.update).mockResolvedValue({
      id: 'pr-1',
      status: 'AVAILABLE',
      claimedById: null,
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', action: 'unclaim' }),
    });
    await PATCH(req);

    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: {
        status: 'AVAILABLE',
        claimedById: null,
      },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
      },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.update).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', action: 'claim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating product status' });
  });
});
