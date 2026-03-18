/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, PUT } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productType: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/product-types - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = { json: async () => ({ productTypeId: 'pt-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productTypeId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = { json: async () => ({}) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product type ID is required' });
  });

  it('should return product type for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const productType = { id: 'pt-1', category: 'Produce', product: [] };
    vi.mocked(prisma.productType.findUnique).mockResolvedValue(productType as any);

    const req = { json: async () => ({ productTypeId: 'pt-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(productType);
    expect(prisma.productType.findUnique).toHaveBeenCalledWith({
      where: { id: 'pt-1' },
      include: { product: true },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productType.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = { json: async () => ({ productTypeId: 'pt-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching product type(s)' });
  });
});

describe('/api/product-types - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'POST',
      body: JSON.stringify({ category: 'Produce' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create product type for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { category: 'Produce' };
    const created = { id: 'pt-1', ...payload, product: [] };
    vi.mocked(prisma.productType.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.productType.create).toHaveBeenCalledWith({
      data: payload,
      include: { product: true },
    });
  });

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productType.create).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'POST',
      body: JSON.stringify({ category: 'Produce' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating product type' });
  });
});

describe('/api/product-types - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'PUT',
      body: JSON.stringify({ id: 'pt-1', category: 'Updated' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update product type for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { id: 'pt-1', category: 'Updated' };
    const updated = { ...payload, product: [] };
    vi.mocked(prisma.productType.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.productType.update).toHaveBeenCalledWith({
      where: { id: 'pt-1' },
      data: payload,
      include: { product: true },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productType.update).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'PUT',
      body: JSON.stringify({ id: 'pt-1', category: 'Updated' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating product type' });
  });
});

describe('/api/product-types - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'DELETE',
      body: JSON.stringify({ productTypeId: 'pt-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productTypeId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product type ID is required' });
  });

  it('should delete product type for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productType.delete).mockResolvedValue({ id: 'pt-1' } as any);

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'DELETE',
      body: JSON.stringify({ productTypeId: 'pt-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 'pt-1' });
    expect(prisma.productType.delete).toHaveBeenCalledWith({
      where: { id: 'pt-1' },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productType.delete).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/product-types', {
      method: 'DELETE',
      body: JSON.stringify({ productTypeId: 'pt-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error deleting product type' });
  });
});
