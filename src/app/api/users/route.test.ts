/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
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

describe('/api/users - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should return all users for ADMIN role', async () => {
    const mockUsers = [
      {
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'ADMIN',
        supplier: null,
        nonprofit: null,
        productSurvey: null,
        createdAt: new Date('2026-02-15T12:00:00.000Z'),
        updatedAt: new Date('2026-02-15T12:00:00.000Z'),
      },
      {
        id: '2',
        email: 'user@test.com',
        name: 'Regular User',
        role: 'NONPROFIT',
        supplier: null,
        nonprofit: null,
        productSurvey: null,
        createdAt: new Date('2026-02-15T12:00:00.000Z'),
        updatedAt: new Date('2026-02-15T12:00:00.000Z'),
      },
    ];

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    // Dates are serialized to strings in JSON response
    expect(data).toEqual(
      mockUsers.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))
    );
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  it('should return single user for SUPPLIER role', async () => {
    const mockUser = {
      id: '2',
      email: 'supplier@test.com',
      name: 'Supplier User',
      role: 'SUPPLIER',
      supplier: { id: 's1', name: 'Test Supplier' },
      nonprofit: null,
      productSurvey: null,
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '2', email: 'supplier@test.com', role: 'SUPPLIER' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '2' },
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });
  });

  it('should return 403 for non-ADMIN, non-SUPPLIER roles', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '3', email: 'nonprofit@test.com', role: 'NONPROFIT' },
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Not authorized' });
  });

  it('should return 404 if user not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '2', email: 'supplier@test.com', role: 'SUPPLIER' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'User not found' });
  });
});

describe('/api/users - POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'user@test.com', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should create user with valid data', async () => {
    const newUserData = {
      email: 'newuser@test.com',
      name: 'New User',
      role: 'NONPROFIT',
    };

    const createdUser = {
      id: '3',
      ...newUserData,
      supplier: null,
      nonprofit: null,
      productSurvey: null,
      createdAt: new Date('2026-02-15T12:00:00.000Z'),
      updatedAt: new Date('2026-02-15T12:00:00.000Z'),
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.create).mockResolvedValue(createdUser as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify(newUserData),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Dates are serialized to strings in JSON response
    expect(data).toEqual({
      ...createdUser,
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'newuser@test.com',
        name: 'New User',
        role: 'NONPROFIT',
      }),
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });
  });

  it('should filter out undefined fields', async () => {
    const newUserData = {
      email: 'newuser@test.com',
      name: undefined,
      role: 'NONPROFIT',
      phoneNumber: '555-1234',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.create).mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify(newUserData),
    });

    await POST(req);

    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(createCall.data).not.toHaveProperty('name');
    expect(createCall.data).toHaveProperty('email');
    expect(createCall.data).toHaveProperty('phoneNumber');
  });
});

describe('/api/users - PATCH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify({ id: '1', name: 'Updated Name' }),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should allow user to update their own data', async () => {
    const userId = '2';
    const userData = {
      id: userId,
      name: 'Updated Name',
      email: 'updated@test.com',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: userId, email: 'user@test.com', role: 'NONPROFIT' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: userId,
      email: 'user@test.com',
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({
      ...userData,
      supplier: null,
      nonprofit: null,
      productSurvey: null,
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Updated Name');
  });

  it('should allow ADMIN to update any user', async () => {
    const targetUserId = '3';
    const userData = {
      id: targetUserId,
      name: 'Admin Updated',
      role: 'STAFF',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: targetUserId,
      email: 'target@test.com',
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({
      ...userData,
      supplier: null,
      nonprofit: null,
      productSurvey: null,
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    const response = await PATCH(req);

    expect(response.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: targetUserId },
      })
    );
  });

  it('should return 403 if non-admin tries to update other user', async () => {
    const userData = {
      id: '999',
      name: 'Hacker Attempt',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '2', email: 'user@test.com', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 404 if target user does not exist', async () => {
    const userData = {
      id: '999',
      name: 'Updated Name',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'User not found' });
  });

  it('should handle nonprofit document uploads separately', async () => {
    const userData = {
      id: '2',
      nonprofit: {
        create: {
          nonprofitDocument: {
            create: {
              fileData: { 0: 72, 1: 101, 2: 108, 3: 108, 4: 111 }, // "Hello" as buffer
              fileName: 'test.pdf',
            },
          },
        },
      },
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '2', email: 'nonprofit@test.com', role: 'NONPROFIT' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '2',
      email: 'nonprofit@test.com',
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({
      id: '2',
      email: 'nonprofit@test.com',
      nonprofit: { id: 'n1', name: 'Test Nonprofit' },
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    const response = await PATCH(req);

    expect(response.status).toBe(200);
    // Verify it used the full userData, not sanitized version
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nonprofit: expect.any(Object),
        }),
      })
    );
  });

  it('should sanitize simple admin edits', async () => {
    const userData = {
      id: '2',
      name: 'Clean Update',
      email: 'clean@test.com',
      role: 'STAFF',
      // These should be filtered out
      supplier: { id: 'bad' },
      nonprofit: { id: 'bad' },
      randomField: 'should-not-exist',
    };

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '2',
      email: 'user@test.com',
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });

    await PATCH(req);

    const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('name', 'Clean Update');
    expect(updateCall.data).toHaveProperty('email', 'clean@test.com');
    expect(updateCall.data).toHaveProperty('role', 'STAFF');
    expect(updateCall.data).not.toHaveProperty('supplier');
    expect(updateCall.data).not.toHaveProperty('randomField');
  });
});

describe('/api/users - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'DELETE',
      body: JSON.stringify('user-id-123'),
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should return 401 if user is not ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '2', email: 'user@test.com', role: 'NONPROFIT' },
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'DELETE',
      body: JSON.stringify('user-id-123'),
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Not authenticated' });
  });

  it('should delete user as ADMIN', async () => {
    const userIdToDelete = '3';

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    vi.mocked(prisma.user.delete).mockResolvedValue({
      id: userIdToDelete,
      email: 'deleted@test.com',
      name: 'Deleted User',
      supplier: null,
      nonprofit: null,
      productSurvey: null,
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'DELETE',
      body: JSON.stringify(userIdToDelete),
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(userIdToDelete);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: userIdToDelete },
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });
  });

  it('should return 400 if userId is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: 'ADMIN' },
    } as any);

    const req = new NextRequest('http://localhost/api/users', {
      method: 'DELETE',
      body: JSON.stringify(null),
    });

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'User ID is required' });
  });
});
