/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productRequest: {
      findMany: vi.fn(),
    },
  },
}));

const makeRequest = (supplierId?: string) =>
  new NextRequest(
    `http://localhost/api/analytics/supplier-metrics${supplierId ? `?supplierId=${supplierId}` : ''}`
  );

const makeProduct = (
  status: string,
  createdAt: Date,
  updatedAt: Date,
  overrides?: Partial<any>
) => ({
  id: Math.random().toString(),
  status,
  createdAt,
  updatedAt,
  quantity: 10,
  productType: {
    protein: false,
    produce: false,
    shelfStable: false,
    shelfStableIndividualServing: false,
    alreadyPreparedFood: false,
    other: false,
    ...overrides?.productType,
  },
  ...overrides,
});

describe('/api/analytics/supplier-metrics - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 400 when supplierId is missing', async () => {
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Supplier ID is required' });
  });

  it('should return statusBreakdown correctly', async () => {
    const now = new Date();
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      makeProduct('AVAILABLE', now, now),
      makeProduct('AVAILABLE', now, now),
      makeProduct('RESERVED', now, now),
      makeProduct('PENDING', now, now),
    ] as any);

    const response = await GET(makeRequest('supplier-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statusBreakdown).toEqual({
      AVAILABLE: 2,
      RESERVED: 1,
      PENDING: 1,
    });
  });

  it('should calculate claimSpeeds correctly', async () => {
    const base = new Date('2025-12-01T00:00:00.000Z');
    const h12 = new Date(base.getTime() + 12 * 60 * 60 * 1000); // 12h later
    const h36 = new Date(base.getTime() + 36 * 60 * 60 * 1000); // 36h later
    const h100 = new Date(base.getTime() + 100 * 60 * 60 * 1000); // 100h later
    const h200 = new Date(base.getTime() + 200 * 60 * 60 * 1000); // 200h later

    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      makeProduct('RESERVED', base, h12),
      makeProduct('RESERVED', base, h36),
      makeProduct('PENDING', base, h100),
      makeProduct('PENDING', base, h200),
    ] as any);

    const response = await GET(makeRequest('supplier-1'));
    const data = await response.json();

    expect(data.claimSpeeds).toEqual({
      within24h: 1,
      within48h: 1,
      within1week: 1,
      moreThan1week: 1,
    });
  });

  it('should return product type breakdown correctly', async () => {
    const now = new Date();
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      makeProduct('AVAILABLE', now, now, {
        productType: {
          protein: true,
          produce: false,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      }),
      makeProduct('AVAILABLE', now, now, {
        productType: {
          protein: false,
          produce: true,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      }),
    ] as any);

    const response = await GET(makeRequest('supplier-1'));
    const data = await response.json();

    expect(data.typeBreakdown.protein).toBe(1);
    expect(data.typeBreakdown.produce).toBe(1);
  });

  it('should return totalProducts count', async () => {
    const now = new Date();
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      makeProduct('AVAILABLE', now, now),
      makeProduct('RESERVED', now, now),
      makeProduct('PENDING', now, now),
    ] as any);

    const response = await GET(makeRequest('supplier-1'));
    const data = await response.json();

    expect(data.totalProducts).toBe(3);
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET(makeRequest('supplier-1'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch supplier metrics' });
  });
});
