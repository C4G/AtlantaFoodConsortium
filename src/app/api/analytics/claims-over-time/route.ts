import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const claimedProducts = await prisma.productRequest.findMany({
      where: {
        claimedById: { not: null },
      },
      select: {
        updatedAt: true,
      },
    });

    const monthlyData = new Map<string, number>();
    claimedProducts.forEach((product) => {
      const monthKey = product.updatedAt.toISOString().substring(0, 7);
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    const timeline = Array.from(monthlyData.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Error fetching claims over time:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims over time' },
      { status: 500 }
    );
  }
}
