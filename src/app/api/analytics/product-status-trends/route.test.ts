/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productRequest: {
      findMany: vi.fn(),
    },
  },
}));

describe('/api/analytics/product-status-trends - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return trends grouped by date and status', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      { status: 'AVAILABLE', createdAt: new Date('2025-12-01T10:00:00.000Z') },
      { status: 'AVAILABLE', createdAt: new Date('2025-12-01T14:00:00.000Z') },
      { status: 'RESERVED', createdAt: new Date('2025-12-01T16:00:00.000Z') },
      { status: 'PENDING', createdAt: new Date('2025-12-02T10:00:00.000Z') },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.trends).toHaveLength(2);

    const dec1 = data.trends.find((t: any) => t.date === '2025-12-01');
    expect(dec1).toEqual({
      date: '2025-12-01',
      AVAILABLE: 2,
      RESERVED: 1,
      PENDING: 0,
    });

    const dec2 = data.trends.find((t: any) => t.date === '2025-12-02');
    expect(dec2).toEqual({
      date: '2025-12-02',
      AVAILABLE: 0,
      RESERVED: 0,
      PENDING: 1,
    });
  });

  it('should return empty trends when no product requests exist', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.trends).toEqual([]);
  });

  it('should only count AVAILABLE, RESERVED, and PENDING statuses', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      { status: 'AVAILABLE', createdAt: new Date('2025-11-10T10:00:00.000Z') },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    const entry = data.trends[0];
    expect(entry.AVAILABLE).toBe(1);
    expect(entry.RESERVED).toBe(0);
    expect(entry.PENDING).toBe(0);
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch product status trends' });
  });
});
