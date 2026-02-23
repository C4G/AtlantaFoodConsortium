/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    nonprofit: {
      findMany: vi.fn(),
    },
  },
}));

const mockNonprofits = [
  {
    id: 'n1',
    name: 'Food Bank A',
    organizationType: 'FOOD_BANK',
    nonprofitDocumentApproval: true,
    _count: { productsClaimed: 5 },
  },
  {
    id: 'n2',
    name: 'Pantry B',
    organizationType: 'PANTRY',
    nonprofitDocumentApproval: false,
    _count: { productsClaimed: 2 },
  },
  {
    id: 'n3',
    name: 'Student Pantry C',
    organizationType: 'STUDENT_PANTRY',
    nonprofitDocumentApproval: null,
    _count: { productsClaimed: 0 },
  },
];

describe('/api/analytics/nonprofit-engagement - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return engagement list, orgTypeBreakdown, and approvalBreakdown', async () => {
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue(
      mockNonprofits as any
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.engagement).toHaveLength(3);
    expect(data.engagement[0]).toMatchObject({
      nonprofitId: 'n1',
      name: 'Food Bank A',
      organizationType: 'FOOD_BANK',
      claimedCount: 5,
      approvalStatus: true,
    });
  });

  it('should correctly calculate orgTypeBreakdown', async () => {
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue(
      mockNonprofits as any
    );

    const response = await GET();
    const data = await response.json();

    expect(data.orgTypeBreakdown).toEqual({
      FOOD_BANK: 1,
      PANTRY: 1,
      STUDENT_PANTRY: 1,
      FOOD_RESCUE: 0,
      AGRICULTURE: 0,
      OTHER: 0,
    });
  });

  it('should correctly calculate approvalBreakdown', async () => {
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue(
      mockNonprofits as any
    );

    const response = await GET();
    const data = await response.json();

    expect(data.approvalBreakdown).toEqual({
      approved: 1,
      pending: 1,
      rejected: 1,
    });
  });

  it('should return empty results when no nonprofits exist', async () => {
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.engagement).toEqual([]);
    expect(data.approvalBreakdown).toEqual({
      approved: 0,
      pending: 0,
      rejected: 0,
    });
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.nonprofit.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch nonprofit engagement' });
  });
});
