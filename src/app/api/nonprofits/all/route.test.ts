/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    nonprofit: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/nonprofits/all - GET', () => {
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

  it('should return all nonprofits for authenticated users', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', role: 'SUPPLIER' },
    } as any);

    const nonprofits = [
      {
        id: 'np-1',
        name: 'Community Pantry',
        users: [{ id: 'u-1', email: 'np1@test.com' }],
        productsClaimed: [],
      },
      {
        id: 'np-2',
        name: 'Food Bank Atlanta',
        users: [{ id: 'u-2', email: 'np2@test.com' }],
        productsClaimed: [],
      },
    ];

    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue(nonprofits as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(nonprofits);
    expect(prisma.nonprofit.findMany).toHaveBeenCalledWith({
      include: {
        users: true,
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
      user: { id: 'user-1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofit.findMany).mockRejectedValue(
      new Error('db failure')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error fetching nonprofits');
  });
});
