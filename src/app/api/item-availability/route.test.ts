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
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    productType: {
      create: vi.fn(),
    },
    pickupInfo: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
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
      {
        id: 'pr-1',
        status: 'AVAILABLE',
        productType: {},
        supplier: {},
        pickupInfo: {},
      },
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

  it('should fully unclaim product and restore it to AVAILABLE', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    // findUnique is now called first to detect claim type (null = full claim)
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      originalProductId: null,
      quantity: 10,
    } as any);
    const restored = {
      id: 'pr-1',
      status: 'AVAILABLE',
      claimedById: null,
      productType: {},
      supplier: {},
      pickupInfo: {},
    };
    vi.mocked(prisma.productRequest.update).mockResolvedValue(restored as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', action: 'unclaim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('AVAILABLE');
    expect(data.claimedById).toBeNull();
    expect(prisma.productRequest.findUnique).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      select: { originalProductId: true, quantity: true },
    });
    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: { status: 'AVAILABLE', claimedById: null },
      include: { productType: true, supplier: true, pickupInfo: true },
    });
  });

  it('should return 404 if product is not found during unclaim', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-ghost', action: 'unclaim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product not found' });
  });

  it('should partially unclaim and merge quantity back into the original', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    // A partial-claim record always has originalProductId set
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      originalProductId: 'pr-original',
      quantity: 30,
    } as any);
    // Execute the transaction callback synchronously using the prisma mock as tx
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(prisma)
    );
    // update returns the merged original (70 remaining + 30 unclaimed = 100)
    vi.mocked(prisma.productRequest.update).mockResolvedValue({
      id: 'pr-original',
      quantity: 100,
    } as any);
    vi.mocked(prisma.productRequest.delete).mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-claimed', action: 'unclaim' }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      merged: true,
      originalProductId: 'pr-original',
      updatedQuantity: 100,
    });
    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-original' },
      data: { quantity: { increment: 30 } },
      select: { id: true, quantity: true },
    });
    expect(prisma.productRequest.delete).toHaveBeenCalledWith({
      where: { id: 'pr-claimed' },
    });
  });

  it('should return 404 if product does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-999', quantityClaimed: 1 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product not found' });
  });

  it('should return 409 if product is no longer AVAILABLE', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      quantity: 10,
      status: 'RESERVED',
      productType: null,
      pickupInfo: null,
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', quantityClaimed: 5 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({ error: 'Product is no longer available' });
  });

  it('should return 400 for an invalid quantity (exceeds available)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      quantity: 10,
      status: 'AVAILABLE',
      productType: null,
      pickupInfo: null,
    } as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', quantityClaimed: 99 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/invalid quantity/i);
  });

  it('should fully claim product when quantityClaimed equals available quantity', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      quantity: 10,
      status: 'AVAILABLE',
      productType: null,
      pickupInfo: null,
    } as any);
    const updated = {
      id: 'pr-1',
      status: 'RESERVED',
      claimedById: 'nonprofit-1',
      quantity: 10,
      productType: {},
      supplier: {},
      pickupInfo: {},
    };
    vi.mocked(prisma.productRequest.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', quantityClaimed: 10 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('RESERVED');
    expect(data.claimedById).toBe('nonprofit-1');
    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: { status: 'RESERVED', claimedById: 'nonprofit-1' },
      include: { productType: true, supplier: true, pickupInfo: true },
    });
  });

  it('should partially claim product and return claimed record + remaining quantity', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockResolvedValue({
      id: 'pr-1',
      quantity: 10,
      status: 'AVAILABLE',
      name: 'Apples',
      unit: 'lbs',
      description: 'Fresh apples',
      supplierId: 'sup-1',
      productType: { protein: false, produce: true, proteinTypes: [] },
      pickupInfo: {
        pickupDate: new Date('2026-05-01'),
        pickupTimeframe: ['MORNING'],
        pickupLocation: '123 Main St',
        pickupInstructions: 'Ring bell',
        contactName: 'John',
        contactPhone: '555-0100',
      },
    } as any);

    const newClaim = {
      id: 'pr-new',
      status: 'RESERVED',
      claimedById: 'nonprofit-1',
      quantity: 4,
      name: 'Apples',
      productType: {},
      supplier: {},
      pickupInfo: {},
    };

    // Mock $transaction (callback form) by executing the callback with the prisma client
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(prisma)
    );
    vi.mocked(prisma.productType.create).mockResolvedValue({
      id: 'pt-new',
    } as any);
    vi.mocked(prisma.pickupInfo.create).mockResolvedValue({
      id: 'pi-new',
    } as any);
    vi.mocked(prisma.productRequest.create).mockResolvedValue(newClaim as any);
    vi.mocked(prisma.productRequest.update).mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', quantityClaimed: 4 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.claimed.status).toBe('RESERVED');
    expect(data.claimed.quantity).toBe(4);
    expect(data.originalProductId).toBe('pr-1');
    expect(data.remainingQuantity).toBe(6);
    // Original product quantity should be reduced
    expect(prisma.productRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 6 } })
    );
  });

  it('should return 500 when an error is thrown', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT', nonprofitId: 'nonprofit-1' },
    } as any);
    vi.mocked(prisma.productRequest.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/item-availability', {
      method: 'PATCH',
      body: JSON.stringify({ productId: 'pr-1', quantityClaimed: 10 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating product status' });
  });
});
