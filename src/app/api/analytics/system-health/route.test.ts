/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    supplier: {
      count: vi.fn(),
    },
    nonprofit: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    productRequest: {
      count: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('/api/analytics/system-health - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return full system health metrics', async () => {
    vi.mocked(prisma.user.groupBy).mockResolvedValue([
      { role: 'ADMIN', _count: { id: 2 } },
      { role: 'SUPPLIER', _count: { id: 3 } },
      { role: 'NONPROFIT', _count: { id: 5 } },
    ] as any);

    vi.mocked(prisma.user.count).mockResolvedValue(10);
    vi.mocked(prisma.supplier.count).mockResolvedValue(3);
    vi.mocked(prisma.nonprofit.count).mockResolvedValue(5);
    vi.mocked(prisma.productRequest.count).mockResolvedValue(20);

    vi.mocked(prisma.productRequest.groupBy).mockResolvedValue([
      { status: 'AVAILABLE', _count: { id: 10 } },
      { status: 'RESERVED', _count: { id: 5 } },
      { status: 'PENDING', _count: { id: 5 } },
    ] as any);

    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      {
        createdAt: new Date('2025-12-01T00:00:00.000Z'),
        updatedAt: new Date('2025-12-01T12:00:00.000Z'), // 12h diff
      },
      {
        createdAt: new Date('2025-12-02T00:00:00.000Z'),
        updatedAt: new Date('2025-12-02T24:00:00.000Z'), // 24h diff
      },
    ] as any);

    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      { nonprofitDocumentApproval: true },
      { nonprofitDocumentApproval: true },
      { nonprofitDocumentApproval: false },
      { nonprofitDocumentApproval: null },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.totalUsers).toBe(10);
    expect(data.totalSuppliers).toBe(3);
    expect(data.totalNonprofits).toBe(5);
    expect(data.totalProducts).toBe(20);
    expect(data.usersByRole).toEqual({
      ADMIN: 2,
      STAFF: 0,
      SUPPLIER: 3,
      NONPROFIT: 5,
    });
    expect(data.productsByStatus).toEqual({
      AVAILABLE: 10,
      RESERVED: 5,
      PENDING: 5,
    });
    // avg of 12h and 24h = 18h
    expect(data.avgClaimTimeHours).toBe(18);
    // 2 approved out of 3 with decisions = 0.67
    expect(data.approvalRate).toBe(0.67);
  });

  it('should return avgClaimTimeHours of 0 when no claimed products', async () => {
    vi.mocked(prisma.user.groupBy).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);
    vi.mocked(prisma.supplier.count).mockResolvedValue(0);
    vi.mocked(prisma.nonprofit.count).mockResolvedValue(0);
    vi.mocked(prisma.productRequest.count).mockResolvedValue(0);
    vi.mocked(prisma.productRequest.groupBy).mockResolvedValue([] as any);
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([]);
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.avgClaimTimeHours).toBe(0);
  });

  it('should return approvalRate of 0 when no decisions made', async () => {
    vi.mocked(prisma.user.groupBy).mockResolvedValue([] as any);
    vi.mocked(prisma.user.count).mockResolvedValue(0);
    vi.mocked(prisma.supplier.count).mockResolvedValue(0);
    vi.mocked(prisma.nonprofit.count).mockResolvedValue(0);
    vi.mocked(prisma.productRequest.count).mockResolvedValue(0);
    vi.mocked(prisma.productRequest.groupBy).mockResolvedValue([] as any);
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([]);
    // all nonprofits still pending
    vi.mocked(prisma.nonprofit.findMany).mockResolvedValue([
      { nonprofitDocumentApproval: null },
      { nonprofitDocumentApproval: null },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.approvalRate).toBe(0);
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.user.groupBy).mockRejectedValue(new Error('DB error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch system health' });
  });
});
