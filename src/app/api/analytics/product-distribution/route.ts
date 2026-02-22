import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all product types with their counts
    const productTypes = await prisma.productType.findMany({
      select: {
        protein: true,
        produce: true,
        shelfStable: true,
        shelfStableIndividualServing: true,
        alreadyPreparedFood: true,
        other: true,
        proteinTypes: true,
      },
    });

    // Count by category
    const distribution = {
      protein: productTypes.filter((pt) => pt.protein).length,
      produce: productTypes.filter((pt) => pt.produce).length,
      shelfStable: productTypes.filter((pt) => pt.shelfStable).length,
      shelfStableIndividualServing: productTypes.filter(
        (pt) => pt.shelfStableIndividualServing
      ).length,
      alreadyPreparedFood: productTypes.filter((pt) => pt.alreadyPreparedFood)
        .length,
      other: productTypes.filter((pt) => pt.other).length,
    };

    // Count protein subtypes
    const proteinTypeCount: Record<string, number> = {};
    productTypes
      .filter((pt) => pt.protein && pt.proteinTypes)
      .forEach((pt) => {
        pt.proteinTypes.forEach((type) => {
          proteinTypeCount[type] = (proteinTypeCount[type] || 0) + 1;
        });
      });

    return NextResponse.json({
      distribution,
      proteinTypes: proteinTypeCount,
    });
  } catch (error) {
    console.error('Error fetching product distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product distribution' },
      { status: 500 }
    );
  }
}
