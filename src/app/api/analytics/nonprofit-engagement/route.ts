import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all nonprofits with their claimed product counts
    const nonprofits = await prisma.nonprofit.findMany({
      select: {
        id: true,
        name: true,
        organizationType: true,
        nonprofitDocumentApproval: true,
        _count: {
          select: {
            productsClaimed: true,
          },
        },
      },
      orderBy: {
        productsClaimed: {
          _count: 'desc',
        },
      },
    });

    const engagement = nonprofits.map((nonprofit) => ({
      nonprofitId: nonprofit.id,
      name: nonprofit.name,
      organizationType: nonprofit.organizationType,
      claimedCount: nonprofit._count.productsClaimed,
      approvalStatus: nonprofit.nonprofitDocumentApproval,
    }));

    // Get organization type breakdown
    const orgTypeBreakdown = {
      FOOD_BANK: nonprofits.filter((n) => n.organizationType === 'FOOD_BANK')
        .length,
      PANTRY: nonprofits.filter((n) => n.organizationType === 'PANTRY').length,
      STUDENT_PANTRY: nonprofits.filter(
        (n) => n.organizationType === 'STUDENT_PANTRY'
      ).length,
      FOOD_RESCUE: nonprofits.filter(
        (n) => n.organizationType === 'FOOD_RESCUE'
      ).length,
      AGRICULTURE: nonprofits.filter(
        (n) => n.organizationType === 'AGRICULTURE'
      ).length,
      OTHER: nonprofits.filter((n) => n.organizationType === 'OTHER').length,
    };

    // Get approval status breakdown
    const approvalBreakdown = {
      approved: nonprofits.filter((n) => n.nonprofitDocumentApproval === true)
        .length,
      pending: nonprofits.filter((n) => n.nonprofitDocumentApproval === null)
        .length,
      rejected: nonprofits.filter((n) => n.nonprofitDocumentApproval === false)
        .length,
    };

    return NextResponse.json({
      engagement: engagement,
      orgTypeBreakdown,
      approvalBreakdown,
    });
  } catch (error) {
    console.error('Error fetching nonprofit engagement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nonprofit engagement' },
      { status: 500 }
    );
  }
}
