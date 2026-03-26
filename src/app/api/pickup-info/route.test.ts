/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, POST, PUT } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pickupInfo: {
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

describe('/api/pickup-info - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = { json: async () => ({ pickupInfoId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if pickupInfoId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = { json: async () => ({}) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Pickup info ID is required' });
  });

  it('should return pickup info for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const pickupInfo = { id: 'pi-1', address: '123 Main St', product: [] };
    vi.mocked(prisma.pickupInfo.findUnique).mockResolvedValue(pickupInfo as any);

    const req = { json: async () => ({ pickupInfoId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(pickupInfo);
    expect(prisma.pickupInfo.findUnique).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
      include: { product: true },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.pickupInfo.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = { json: async () => ({ pickupInfoId: 'pi-1' }) } as Request;
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching pickup info' });
  });
});

describe('/api/pickup-info - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'POST',
      body: JSON.stringify({ address: '123 Main St' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create pickup info for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { address: '123 Main St', notes: 'Back dock' };
    const created = { id: 'pi-1', ...payload, product: [] };
    vi.mocked(prisma.pickupInfo.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.pickupInfo.create).toHaveBeenCalledWith({
      data: payload,
      include: { product: true },
    });
  });

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.pickupInfo.create).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'POST',
      body: JSON.stringify({ address: '123 Main St' }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating pickup info' });
  });
});

describe('/api/pickup-info - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'PUT',
      body: JSON.stringify({ id: 'pi-1', address: 'Updated' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update pickup info for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const payload = { id: 'pi-1', address: 'Updated' };
    const updated = { ...payload, product: [] };
    vi.mocked(prisma.pickupInfo.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.pickupInfo.update).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
      data: payload,
      include: { product: true },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.pickupInfo.update).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'PUT',
      body: JSON.stringify({ id: 'pi-1', address: 'Updated' }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating pickup info' });
  });
});

describe('/api/pickup-info - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'DELETE',
      body: JSON.stringify({ pickupInfoId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if pickupInfoId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Pickup info ID is required' });
  });

  it('should delete pickup info for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.pickupInfo.delete).mockResolvedValue({ id: 'pi-1' } as any);

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'DELETE',
      body: JSON.stringify({ pickupInfoId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: 'pi-1' });
    expect(prisma.pickupInfo.delete).toHaveBeenCalledWith({
      where: { id: 'pi-1' },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.pickupInfo.delete).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/pickup-info', {
      method: 'DELETE',
      body: JSON.stringify({ pickupInfoId: 'pi-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error deleting pickup info' });
  });
});
