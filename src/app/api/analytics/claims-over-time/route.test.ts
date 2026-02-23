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

describe('/api/analytics/claims-over-time - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return a timeline grouped by month', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      { updatedAt: new Date('2025-11-10T10:00:00.000Z') },
      { updatedAt: new Date('2025-11-20T10:00:00.000Z') },
      { updatedAt: new Date('2025-12-05T10:00:00.000Z') },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeline).toEqual([
      { month: '2025-11', count: 2 },
      { month: '2025-12', count: 1 },
    ]);
  });

  it('should return an empty timeline when no claimed products exist', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeline).toEqual([]);
  });

  it('should return sorted timeline in ascending order', async () => {
    vi.mocked(prisma.productRequest.findMany).mockResolvedValue([
      { updatedAt: new Date('2026-01-15T10:00:00.000Z') },
      { updatedAt: new Date('2025-10-01T10:00:00.000Z') },
      { updatedAt: new Date('2025-12-20T10:00:00.000Z') },
    ] as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timeline[0].month).toBe('2025-10');
    expect(data.timeline[1].month).toBe('2025-12');
    expect(data.timeline[2].month).toBe('2026-01');
  });

  it('should return 500 when a database error occurs', async () => {
    vi.mocked(prisma.productRequest.findMany).mockRejectedValue(
      new Error('DB error')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch claims over time' });
  });
});
