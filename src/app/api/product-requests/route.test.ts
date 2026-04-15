/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH, POST } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productRequest: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/product-requests - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest(
      'http://localhost/api/product-requests?supplierId=sup-1'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return products for ADMIN with supplierId', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const products = [
      {
        id: 'pr-1',
        supplierId: 'sup-1',
        productType: { id: 'pt-1', name: 'Produce' },
      },
    ];
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue(products as any);

    const req = new NextRequest(
      'http://localhost/api/product-requests?supplierId=sup-1'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(products);
    expect(prisma.productRequest.findMany).toHaveBeenCalledWith({
      where: { supplierId: 'sup-1' },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
  });

  it('should return 400 if supplierId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-requests');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Supplier ID is required' });
  });
});

describe('/api/product-requests - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'POST',
      body: JSON.stringify({ supplierId: 'sup-1', productTypeId: 'pt-1' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create a product request for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = {
      supplierId: 'sup-1',
      productTypeId: 'pt-1',
      quantity: 25,
    };
    const created = {
      id: 'pr-1',
      ...payload,
      productType: { id: 'pt-1' },
      supplier: { id: 'sup-1' },
      pickupInfo: null,
      claimingNonprofit: null,
    };
    vi.mocked(prisma.productRequest.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.productRequest.create).toHaveBeenCalledWith({
      data: payload,
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
  });
});

describe('/api/product-requests - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'PATCH',
      body: JSON.stringify({ id: 'pr-1', quantity: 5 }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update a product request for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { id: 'pr-1', quantity: 10 };
    const updated = {
      ...payload,
      productType: { id: 'pt-1' },
      supplier: { id: 'sup-1' },
      pickupInfo: null,
      claimingNonprofit: null,
    };
    vi.mocked(prisma.productRequest.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.productRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: payload,
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
  });
});

describe('/api/product-requests - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'DELETE',
      body: JSON.stringify({ product: { id: 'pr-1' } }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if product payload is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product ID is required' });
  });

  it('should delete a product request for SUPPLIER', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const deleted = { id: 'pr-1', supplierId: 'sup-1' };
    vi.mocked(prisma.productRequest.delete).mockResolvedValue(deleted as any);

    const req = new NextRequest('http://localhost/api/product-requests', {
      method: 'DELETE',
      body: JSON.stringify({ product: { id: 'pr-1' } }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(deleted);
    expect(prisma.productRequest.delete).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
    });
  });
});
