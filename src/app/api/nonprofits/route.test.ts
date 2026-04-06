/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH, POST, PUT } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
vi.mock('@/lib/prisma', () => ({
  prisma: {
    nonprofit: {
      findFirst: vi.fn(),
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

describe('/api/nonprofits - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/nonprofits');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if nonprofitId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/nonprofits');
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Nonprofit ID is required' });
  });

  it('should return 404 when nonprofit does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.nonprofit.findFirst).mockResolvedValue(null);

    const nonprofitId = 'np-missing';
    const req = new NextRequest(
      `http://localhost/api/nonprofits?nonprofitId=${nonprofitId}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: `Nonprofit not found with ID: ${nonprofitId}`,
    });
    expect(prisma.nonprofit.findFirst).toHaveBeenCalledWith({
      where: { id: nonprofitId },
    });
  });

  it('should return nonprofit details when nonprofit exists', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);

    const nonprofitId = 'np-123';
    const nonprofitExists = { id: nonprofitId, name: 'Atlanta Food Bank' };
    const nonprofitDetails = {
      id: nonprofitId,
      name: 'Atlanta Food Bank',
      productsClaimed: [],
    };

    vi.mocked(prisma.nonprofit.findFirst).mockResolvedValue(nonprofitExists as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue(
      nonprofitDetails as any
    );

    const req = new NextRequest(
      `http://localhost/api/nonprofits?nonprofitId=${nonprofitId}`
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(nonprofitDetails);
    expect(prisma.nonprofit.findUnique).toHaveBeenCalledWith({
      where: { id: nonprofitId },
      include: {
        productsClaimed: {
          include: {
            productType: true,
            pickupInfo: true,
          },
        },
      },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.nonprofit.findFirst).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest(
      'http://localhost/api/nonprofits?nonprofitId=np-123'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error fetching nonprofit');
  });
});

describe('/api/nonprofits - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'POST',
      body: JSON.stringify({ nonprofit: { name: 'NP' } }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should create nonprofit for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const nonprofitPayload = {
      name: 'Community Pantry',
      organizationType: 'PANTRY',
      coldStorageSpace: true,
      shelfSpace: true,
      transportationAvailable: true,
      nonprofitDocumentId: 'doc-1',
    };

    const created = {
      id: 'np-1',
      ...nonprofitPayload,
      users: [],
      productsClaimed: [],
      nonprofitDocument: { id: 'doc-1' },
    };

    vi.mocked(prisma.nonprofit.create).mockResolvedValue(created as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'POST',
      body: JSON.stringify({ nonprofit: nonprofitPayload }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(created);
    expect(prisma.nonprofit.create).toHaveBeenCalledWith({
      data: nonprofitPayload,
      include: {
        nonprofitDocument: true,
        users: true,
        productsClaimed: true,
      },
    });
  });

  it('should return 500 when create fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofit.create).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'POST',
      body: JSON.stringify({ nonprofit: { name: 'Community Pantry' } }),
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error creating nonprofit' });
  });
});

describe('/api/nonprofits - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PUT',
      body: JSON.stringify({ nonprofit: { id: 'np-1', name: 'Updated' } }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update nonprofit for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const nonprofitPayload = {
      id: 'np-1',
      name: 'Updated Nonprofit',
      organizationType: 'PANTRY',
    };

    const updated = {
      ...nonprofitPayload,
      users: [],
      productsClaimed: [],
      nonprofitDocument: null,
    };

    vi.mocked(prisma.nonprofit.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PUT',
      body: JSON.stringify({ nonprofit: nonprofitPayload }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.nonprofit.update).toHaveBeenCalledWith({
      where: { id: nonprofitPayload.id },
      data: nonprofitPayload,
      include: {
        nonprofitDocument: true,
        users: true,
        productsClaimed: true,
      },
    });
  });

  it('should return 500 when update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofit.update).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PUT',
      body: JSON.stringify({ nonprofit: { id: 'np-1', name: 'Updated' } }),
    });
    const response = await PUT(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error updating nonprofit' });
  });
});

describe('/api/nonprofits - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'DELETE',
      body: JSON.stringify({ nonprofitId: 'np-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should delete nonprofit for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const deleted = { id: 'np-1', name: 'Deleted Nonprofit' };
    vi.mocked(prisma.nonprofit.delete).mockResolvedValue(deleted as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'DELETE',
      body: JSON.stringify({ nonprofitId: 'np-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(deleted);
    expect(prisma.nonprofit.delete).toHaveBeenCalledWith({
      where: { id: 'np-1' },
    });
  });

  it('should return 500 when delete fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofit.delete).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'DELETE',
      body: JSON.stringify({ nonprofitId: 'np-1' }),
    });
    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error deleting nonprofit' });
  });
});

describe('/api/nonprofits - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-2', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PATCH',
      body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should update nonprofit approval status for ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const updated = {
      id: 'np-1',
      nonprofitDocumentApproval: true,
    };
    vi.mocked(prisma.nonprofit.update).mockResolvedValue(updated as any);

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PATCH',
      body: JSON.stringify({ nonprofitId: 'np-1', approved: true }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(updated);
    expect(prisma.nonprofit.update).toHaveBeenCalledWith({
      where: { id: 'np-1' },
      data: { nonprofitDocumentApproval: true },
    });
  });

  it('should return 500 when approval update fails', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofit.update).mockRejectedValue(new Error('db fail'));

    const req = new NextRequest('http://localhost/api/nonprofits', {
      method: 'PATCH',
      body: JSON.stringify({ nonprofitId: 'np-1', approved: false }),
    });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to update nonprofit approval status' });
  });
});
