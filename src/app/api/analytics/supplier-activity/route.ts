import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all suppliers with their product counts
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
        cadence: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
    });

    const activity = suppliers.map((supplier) => ({
      supplierId: supplier.id,
      name: supplier.name,
      cadence: supplier.cadence,
      productCount: supplier._count.products,
    }));

    // Get cadence breakdown
    const cadenceBreakdown = {
      DAILY: suppliers.filter((s) => s.cadence === 'DAILY').length,
      WEEKLY: suppliers.filter((s) => s.cadence === 'WEEKLY').length,
      BIWEEKLY: suppliers.filter((s) => s.cadence === 'BIWEEKLY').length,
      MONTHLY: suppliers.filter((s) => s.cadence === 'MONTHLY').length,
      TBD: suppliers.filter((s) => s.cadence === 'TBD').length,
    };

    return NextResponse.json({
      activity: activity,
      cadenceBreakdown,
    });
  } catch (error) {
    console.error('Error fetching supplier activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier activity' },
      { status: 500 }
    );
  }
}
