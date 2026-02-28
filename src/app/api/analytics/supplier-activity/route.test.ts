/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    supplier: {
      findMany: vi.fn(),
    },
  },
}));

const mockSuppliers = [
  {
    id: 's1',
    name: 'Supplier A',
    cadence: 'WEEKLY',
    _count: { products: 10 },
  },
  {
    id: 's2',
    name: 'Supplier B',
    cadence: 'DAILY',
    _count: { products: 5 },
  },
  {
    id: 's3',
    name: 'Supplier C',
    cadence: 'MONTHLY',
    _count: { products: 2 },
  },
];

describe('/api/analytics/supplier-activity - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return activity list and cadenceBreakdown', async () => {
    vi.mocked(prisma.supplier.findMany).mockResolvedValue(mockSuppliers as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.activity).toHaveLength(3);
    expect(data.activity[0]).toMatchObject({
      supplierId: 's1',
      name: 'Supplier A',
      cadence: 'WEEKLY',
      productCount: 10,
    });
  });

  it('should correctly calculate cadenceBreakdown', async () => {
    vi.mocked(prisma.supplier.findMany).mockResolvedValue(mockSuppliers as any);

    const response = await GET();
    const data = await response.json();

    expect(data.cadenceBreakdown).toEqual({
      DAILY: 1,
      WEEKLY: 1,
      BIWEEKLY: 0,
      MONTHLY: 1,
      TBD: 0,
    });
  });

  it('should return empty results when no suppliers exist', async () => {
    vi.mocked(prisma.supplier.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.activity).toEqual([]);
    expect(data.cadenceBreakdown).toEqual({
      DAILY: 0,
      WEEKLY: 0,
      BIWEEKLY: 0,
      MONTHLY: 0,
      TBD: 0,
    });
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.supplier.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch supplier activity' });
  });
});
