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
    nonprofit: {
      findUnique: vi.fn(),
    },
  },
}));

const makeRequest = (nonprofitId?: string) =>
  new NextRequest(
    `http://localhost/api/analytics/nonprofit-metrics${nonprofitId ? `?nonprofitId=${nonprofitId}` : ''}`
  );

describe('/api/analytics/nonprofit-metrics - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 400 when nonprofitId is missing', async () => {
    const response = await GET(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Nonprofit ID is required' });
  });

  it('should return metrics for a valid nonprofitId', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      {
        id: 'pr1',
        name: 'Product 1',
        createdAt: new Date('2025-12-10T10:00:00.000Z'),
        pickupInfo: { pickupDate: new Date('2099-12-01T10:00:00.000Z') },
        productType: {
          protein: true,
          produce: false,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      },
    ] as any);

    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      users: [
        {
          productSurvey: {
            protein: true,
            produce: false,
            shelfStable: false,
            shelfStableIndividualServing: false,
            alreadyPreparedFood: false,
            other: false,
          },
        },
      ],
    } as any);

    // Second call from availableProducts query
    vi.mocked(prisma.productRequest.findMany).mockResolvedValueOnce([
      {
        id: 'pr1',
        name: 'Product 1',
        createdAt: new Date('2025-12-10T10:00:00.000Z'),
        pickupInfo: { pickupDate: new Date('2099-12-01T10:00:00.000Z') },
        productType: {
          protein: true,
          produce: false,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      },
    ] as any);

    const response = await GET(makeRequest('nonprofit-123'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('monthlyTimeline');
    expect(data).toHaveProperty('typeBreakdown');
    expect(data).toHaveProperty('upcomingPickups');
    expect(data).toHaveProperty('matchScore');
    expect(data).toHaveProperty('availabilityTrends');
    expect(data).toHaveProperty('totalClaimed');
  });

  it('should return totalClaimed count correctly', async () => {
    const claimedProducts = [
      {
        id: 'pr1',
        name: 'P1',
        createdAt: new Date('2025-11-01T10:00:00.000Z'),
        pickupInfo: null,
        productType: {
          protein: false,
          produce: true,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      },
      {
        id: 'pr2',
        name: 'P2',
        createdAt: new Date('2025-11-15T10:00:00.000Z'),
        pickupInfo: null,
        productType: {
          protein: true,
          produce: false,
          shelfStable: false,
          shelfStableIndividualServing: false,
          alreadyPreparedFood: false,
          other: false,
        },
      },
    ];

    // First call: claimed products; second call: available products (for recentProducts)
    vi.mocked(prisma.productRequest.findMany)
      .mockResolvedValueOnce(claimedProducts as any)
      .mockResolvedValueOnce([] as any);

    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      users: [],
    } as any);

    const response = await GET(makeRequest('nonprofit-123'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalClaimed).toBe(2);
    expect(data.typeBreakdown.produce).toBe(1);
    expect(data.typeBreakdown.protein).toBe(1);
  });

  it('should return matchScore of 0 when nonprofit has no product survey', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      users: [{ productSurvey: null }],
    } as any);

    vi.mocked(prisma.productRequest.findMany).mockResolvedValueOnce([] as any);

    const response = await GET(makeRequest('nonprofit-123'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.matchScore).toEqual({
      protein: 0,
      produce: 0,
      shelfStable: 0,
      shelfStableIndividualServing: 0,
      alreadyPreparedFood: 0,
      other: 0,
    });
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET(makeRequest('nonprofit-123'));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch nonprofit metrics' });
  });
});
