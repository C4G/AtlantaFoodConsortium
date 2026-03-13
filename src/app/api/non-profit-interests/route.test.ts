/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    productInterests: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('/api/non-profit-interests - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not NONPROFIT', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any);

    const req = new NextRequest(
      'http://localhost/api/non-profit-interests?productSurveyId=survey-1'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return nonprofit interests for NONPROFIT user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-user-1', role: 'NONPROFIT' },
    } as any);

    const mockInterests = {
      id: 'survey-1',
      freshProduce: true,
      proteins: false,
    };
    vi.mocked(prisma.productInterests.findUnique).mockResolvedValue(
      mockInterests as any
    );

    const req = new NextRequest(
      'http://localhost/api/non-profit-interests?productSurveyId=survey-1'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockInterests);
    expect(prisma.productInterests.findUnique).toHaveBeenCalledWith({
      where: { id: 'survey-1' },
    });
  });

  it('should return 500 when prisma throws', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'np-user-1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.productInterests.findUnique).mockRejectedValue(
      new Error('db failure')
    );

    const req = new NextRequest(
      'http://localhost/api/non-profit-interests?productSurveyId=survey-1'
    );
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Error fetching nonprofit interests' });
  });
});
