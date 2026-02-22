import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nonprofitId = searchParams.get('nonprofitId');

    if (!nonprofitId) {
      return NextResponse.json(
        { error: 'Nonprofit ID is required' },
        { status: 400 }
      );
    }

    // Get nonprofit's claimed products
    const claimedProducts = await prisma.productRequest.findMany({
      where: {
        claimedById: nonprofitId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        pickupInfo: {
          select: {
            pickupDate: true,
          },
        },
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

    // Monthly claims timeline
    const monthlyData = new Map<string, number>();
    claimedProducts.forEach((product) => {
      const monthKey = product.createdAt.toISOString().substring(0, 7);
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    const monthlyTimeline = Array.from(monthlyData.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Product type breakdown
    const typeBreakdown = {
      protein: claimedProducts.filter((p) => p.productType.protein).length,
      produce: claimedProducts.filter((p) => p.productType.produce).length,
      shelfStable: claimedProducts.filter((p) => p.productType.shelfStable)
        .length,
      shelfStableIndividualServing: claimedProducts.filter(
        (p) => p.productType.shelfStableIndividualServing
      ).length,
      alreadyPreparedFood: claimedProducts.filter(
        (p) => p.productType.alreadyPreparedFood
      ).length,
      other: claimedProducts.filter((p) => p.productType.other).length,
    };

    // Upcoming pickups (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingPickups = claimedProducts
      .filter((p) => {
        if (!p.pickupInfo) return false;
        const pickupDate = new Date(p.pickupInfo.pickupDate);
        return pickupDate >= now && pickupDate <= thirtyDaysFromNow;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        pickupDate: p.pickupInfo!.pickupDate,
      }));

    // Get nonprofit's product interests
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { id: nonprofitId },
      select: {
        users: {
          select: {
            productSurvey: {
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
        },
      },
    });

    // Get available products matching interests
    const availableProducts = await prisma.productRequest.findMany({
      where: {
        status: 'AVAILABLE',
      },
      select: {
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

    // Calculate match score only if user has product interests from survey
    const userInterests = nonprofit?.users[0]?.productSurvey;
    let matchScore = {
      protein: 0,
      produce: 0,
      shelfStable: 0,
      shelfStableIndividualServing: 0,
      alreadyPreparedFood: 0,
      other: 0,
    };

    if (userInterests && availableProducts.length > 0) {
      matchScore = {
        protein: userInterests.protein
          ? (availableProducts.filter((p) => p.productType.protein).length /
              availableProducts.length) *
            100
          : 0,
        produce: userInterests.produce
          ? (availableProducts.filter((p) => p.productType.produce).length /
              availableProducts.length) *
            100
          : 0,
        shelfStable: userInterests.shelfStable
          ? (availableProducts.filter((p) => p.productType.shelfStable).length /
              availableProducts.length) *
            100
          : 0,
        shelfStableIndividualServing: userInterests.shelfStableIndividualServing
          ? (availableProducts.filter(
              (p) => p.productType.shelfStableIndividualServing
            ).length /
              availableProducts.length) *
            100
          : 0,
        alreadyPreparedFood: userInterests.alreadyPreparedFood
          ? (availableProducts.filter((p) => p.productType.alreadyPreparedFood)
              .length /
              availableProducts.length) *
            100
          : 0,
        other: userInterests.other
          ? (availableProducts.filter((p) => p.productType.other).length /
              availableProducts.length) *
            100
          : 0,
      };
    }

    // Availability trends on last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = await prisma.productRequest.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: 'AVAILABLE',
      },
      select: {
        createdAt: true,
      },
    });

    const dailyAvailability = new Map<string, number>();
    recentProducts.forEach((product) => {
      const dateKey = product.createdAt.toISOString().split('T')[0];
      dailyAvailability.set(dateKey, (dailyAvailability.get(dateKey) || 0) + 1);
    });

    const availabilityTrends = Array.from(dailyAvailability.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      monthlyTimeline,
      typeBreakdown,
      upcomingPickups,
      matchScore,
      availabilityTrends,
      totalClaimed: claimedProducts.length,
    });
  } catch (error) {
    console.error('Error fetching nonprofit metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nonprofit metrics' },
      { status: 500 }
    );
  }
}
