import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    // Get supplier's products
    const products = await prisma.productRequest.findMany({
      where: {
        supplierId,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        quantity: true,
        productType: {
          select: {
            protein: true,
            produce: true,
            shelfStable: true,
            shelfStableIndividualServing: true,
            alreadyPreparedFood: true,
            other: true,
          },
        },
      },
    });

    // Status breakdown
    const statusBreakdown = {
      AVAILABLE: products.filter((p) => p.status === 'AVAILABLE').length,
      RESERVED: products.filter((p) => p.status === 'RESERVED').length,
      PENDING: products.filter((p) => p.status === 'PENDING').length,
    };

    // Claim speed analysis
    const claimedProducts = products.filter((p) =>
      ['RESERVED', 'PENDING'].includes(p.status)
    );
    const claimSpeeds = {
      within24h: 0,
      within48h: 0,
      within1week: 0,
      moreThan1week: 0,
    };

    claimedProducts.forEach((product) => {
      const diffMs = product.updatedAt.getTime() - product.createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 24) claimSpeeds.within24h++;
      else if (diffHours <= 48) claimSpeeds.within48h++;
      else if (diffHours <= 168) claimSpeeds.within1week++;
      else claimSpeeds.moreThan1week++;
    });

    // Monthly timeline for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = new Map<
      string,
      { month: string; count: number; quantity: number }
    >();

    products
      .filter((p) => p.createdAt >= sixMonthsAgo)
      .forEach((product) => {
        const monthKey = product.createdAt.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { month: monthKey, count: 0, quantity: 0 });
        }
        const data = monthlyData.get(monthKey)!;
        data.count++;
        data.quantity += product.quantity;
      });

    const monthlyTimeline = Array.from(monthlyData.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Product type breakdown
    const typeBreakdown = {
      protein: products.filter((p) => p.productType.protein).length,
      produce: products.filter((p) => p.productType.produce).length,
      shelfStable: products.filter((p) => p.productType.shelfStable).length,
      shelfStableIndividualServing: products.filter(
        (p) => p.productType.shelfStableIndividualServing
      ).length,
      alreadyPreparedFood: products.filter(
        (p) => p.productType.alreadyPreparedFood
      ).length,
      other: products.filter((p) => p.productType.other).length,
    };

    return NextResponse.json({
      statusBreakdown,
      claimSpeeds,
      monthlyTimeline,
      typeBreakdown,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error('Error fetching supplier metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier metrics' },
      { status: 500 }
    );
  }
}
