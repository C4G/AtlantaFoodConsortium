/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productType: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/api-auth', () => ({
  requireRole: vi.fn(),
  requireAuth: vi.fn(),
}));

describe('/api/analytics/product-distribution - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(requireRole).mockResolvedValue({
      session: { user: { id: 'user-1', role: 'ADMIN' } } as any,
    });
  });

  it('should return correct distribution counts by category', async () => {
    vi.mocked(prisma.productType.findMany).mockResolvedValue([
      {
        protein: true,
        produce: false,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
        proteinTypes: ['CHICKEN'],
      },
      {
        protein: false,
        produce: true,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
        proteinTypes: [],
      },
      {
        protein: true,
        produce: false,
        shelfStable: true,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
        proteinTypes: ['BEEF'],
      },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.distribution).toEqual({
      protein: 2,
      produce: 1,
      shelfStable: 1,
      shelfStableIndividualServing: 0,
      alreadyPreparedFood: 0,
      other: 0,
    });
  });

  it('should return correct protein subtype counts', async () => {
    vi.mocked(prisma.productType.findMany).mockResolvedValue([
      {
        protein: true,
        produce: false,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
        proteinTypes: ['CHICKEN', 'BEEF'],
      },
      {
        protein: true,
        produce: false,
        shelfStable: false,
        shelfStableIndividualServing: false,
        alreadyPreparedFood: false,
        other: false,
        proteinTypes: ['CHICKEN'],
      },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.proteinTypes).toEqual({ CHICKEN: 2, BEEF: 1 });
  });

  it('should return all zeros when no product types exist', async () => {
    vi.mocked(prisma.productType.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.distribution).toEqual({
      protein: 0,
      produce: 0,
      shelfStable: 0,
      shelfStableIndividualServing: 0,
      alreadyPreparedFood: 0,
      other: 0,
    });
    expect(data.proteinTypes).toEqual({});
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.productType.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch product distribution' });
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as any);

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('should return 403 when the role is not allowed', async () => {
    vi.mocked(requireRole).mockResolvedValue({
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    } as any);

    const response = await GET();

    expect(response.status).toBe(403);
  });
});
