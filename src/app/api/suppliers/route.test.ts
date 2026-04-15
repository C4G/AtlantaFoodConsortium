/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, PUT } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supplier: {
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

describe('/api/suppliers - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = {
      json: async () => ({ supplierId: 'sup-1' }),
    } as unknown as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = {
      json: async () => ({ supplierId: 'sup-1' }),
    } as unknown as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if supplierId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = { json: async () => ({}) } as unknown as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Supplier ID is required' });
  });

  it('should return supplier details for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const supplier = {
      id: 'sup-1',
      name: 'Fresh Farms',
      users: [{ id: 'u-1', email: 'farm@test.com' }],
      products: [{ id: 'p-1', name: 'Apples' }],
    };
    vi.mocked(prisma.supplier.findUnique).mockResolvedValue(supplier as any);

    const req = {
      json: async () => ({ supplierId: 'sup-1' }),
    } as unknown as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(supplier);
    expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
      where: { id: 'sup-1' },
      include: {
        users: true,
        products: true,
      },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.supplier.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = {
      json: async () => ({ supplierId: 'sup-1' }),
    } as unknown as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching supplier(s)' });
  });
});

describe('/api/suppliers - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'POST',
      body: JSON.stringify({ name: 'Fresh Farms' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create a supplier for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const supplierPayload = {
      name: 'Fresh Farms',
      contactEmail: 'farm@test.com',
    };
    const created = {
      id: 'sup-1',
      ...supplierPayload,
      users: [],
      products: [],
    };
    vi.mocked(prisma.supplier.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierPayload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.supplier.create).toHaveBeenCalledWith({
      data: supplierPayload,
      include: {
        users: true,
        products: true,
      },
    });
  });

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.supplier.create).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'POST',
      body: JSON.stringify({ name: 'Fresh Farms' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating supplier' });
  });
});

describe('/api/suppliers - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'PUT',
      body: JSON.stringify({ id: 'sup-1', name: 'Updated Farms' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update a supplier for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const supplierPayload = {
      id: 'sup-1',
      name: 'Updated Farms',
      contactEmail: 'new@test.com',
    };
    const updated = {
      ...supplierPayload,
      users: [],
      products: [],
    };
    vi.mocked(prisma.supplier.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'PUT',
      body: JSON.stringify(supplierPayload),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.supplier.update).toHaveBeenCalledWith({
      where: { id: 'sup-1' },
      data: supplierPayload,
      include: {
        users: true,
        products: true,
      },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.supplier.update).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'PUT',
      body: JSON.stringify({ id: 'sup-1', name: 'Updated Farms' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating supplier' });
  });
});

describe('/api/suppliers - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'DELETE',
      body: JSON.stringify({ supplierId: 'sup-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if supplierId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Supplier ID is required' });
  });

  it('should delete a supplier for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.supplier.delete).mockResolvedValue({ id: 'sup-1' } as any);

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'DELETE',
      body: JSON.stringify({ supplierId: 'sup-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(prisma.supplier.delete).toHaveBeenCalledWith({
      where: { id: 'sup-1' },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.supplier.delete).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/suppliers', {
      method: 'DELETE',
      body: JSON.stringify({ supplierId: 'sup-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error deleting supplier' });
  });
});
