/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, PUT } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productInterests: {
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

describe('/api/product-interests - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);

    const req = { json: async () => ({ productInterestsId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productInterestsId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = { json: async () => ({}) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product interests ID is required' });
  });

  it('should return product interests for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const interests = { id: 'pi-1', proteins: true, users: [] };
    vi.mocked(prisma.productInterests.findUnique).mockResolvedValue(
      interests as any
    );

    const req = { json: async () => ({ productInterestsId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(interests);
    expect(prisma.productInterests.findUnique).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
      include: { users: true },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productInterests.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = { json: async () => ({ productInterestsId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching product interests' });
  });
});

describe('/api/product-interests - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'POST',
      body: JSON.stringify({ productInterestProfile: { proteins: true } }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create product interests for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { proteins: true, freshProduce: false };
    const created = { id: 'pi-1', ...payload, users: [] };
    vi.mocked(prisma.productInterests.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'POST',
      body: JSON.stringify({ productInterestProfile: payload }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.productInterests.create).toHaveBeenCalledWith({
      data: payload,
      include: { users: true },
    });
  });

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productInterests.create).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'POST',
      body: JSON.stringify({ productInterestProfile: { proteins: true } }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating product interests' });
  });
});

describe('/api/product-interests - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'supplier-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'PUT',
      body: JSON.stringify({ productInterestsProfile: { id: 'pi-1', proteins: true } }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update product interests for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { id: 'pi-1', proteins: false };
    const updated = { ...payload, users: [] };
    vi.mocked(prisma.productInterests.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'PUT',
      body: JSON.stringify({ productInterestsProfile: payload }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.productInterests.update).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
      data: payload,
      include: { users: true },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productInterests.update).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'PUT',
      body: JSON.stringify({ productInterestsProfile: { id: 'pi-1' } }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating product interests' });
  });
});

describe('/api/product-interests - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'DELETE',
      body: JSON.stringify({ productInterestsId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if productInterestsId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Product interests ID is required' });
  });

  it('should delete product interests for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productInterests.delete).mockResolvedValue({ id: 'pi-1' } as any);

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'DELETE',
      body: JSON.stringify({ productInterestsId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 'pi-1' });
    expect(prisma.productInterests.delete).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.productInterests.delete).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest('http://localhost/api/product-interests', {
      method: 'DELETE',
      body: JSON.stringify({ productInterestsId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error deleting product interests' });
  });
});
