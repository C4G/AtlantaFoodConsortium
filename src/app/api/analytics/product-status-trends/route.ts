import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all product requests with their status and creation date
    const products = await prisma.productRequest.findMany({
      select: {
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date and status
    const trendsMap = new Map<
      string,
      { date: string; AVAILABLE: number; RESERVED: number; PENDING: number }
    >();

    products.forEach((product) => {
      const dateKey = product.createdAt.toISOString().split('T')[0];
      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, {
          date: dateKey,
          AVAILABLE: 0,
          RESERVED: 0,
          PENDING: 0,
        });
      }

      const entry = trendsMap.get(dateKey)!;
      if (product.status === 'AVAILABLE') entry.AVAILABLE++;
      else if (product.status === 'RESERVED') entry.RESERVED++;
      else if (product.status === 'PENDING') entry.PENDING++;
    });

    const trends = Array.from(trendsMap.values());

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching product status trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product status trends' },
      { status: 500 }
    );
  }
}
