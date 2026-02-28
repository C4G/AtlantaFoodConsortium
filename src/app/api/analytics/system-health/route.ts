import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total users by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const usersByRole = {
      ADMIN: userCounts.find((u) => u.role === 'ADMIN')?._count.id || 0,
      STAFF: userCounts.find((u) => u.role === 'STAFF')?._count.id || 0,
      SUPPLIER: userCounts.find((u) => u.role === 'SUPPLIER')?._count.id || 0,
      NONPROFIT: userCounts.find((u) => u.role === 'NONPROFIT')?._count.id || 0,
    };

    // Get total counts
    const totalUsers = await prisma.user.count();
    const totalSuppliers = await prisma.supplier.count();
    const totalNonprofits = await prisma.nonprofit.count();
    const totalProducts = await prisma.productRequest.count();

    // Get product status counts
    const productStatusCounts = await prisma.productRequest.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const productsByStatus = {
      AVAILABLE:
        productStatusCounts.find((p) => p.status === 'AVAILABLE')?._count.id ||
        0,
      RESERVED:
        productStatusCounts.find((p) => p.status === 'RESERVED')?._count.id ||
        0,
      PENDING:
        productStatusCounts.find((p) => p.status === 'PENDING')?._count.id || 0,
    };

    // Calculate average claim time calculated this from creation to claim status
    const claimedProducts = await prisma.productRequest.findMany({
      where: {
        status: {
          in: ['RESERVED', 'PENDING'],
        },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    let avgClaimTimeHours = 0;
    if (claimedProducts.length > 0) {
      const totalHours = claimedProducts.reduce((sum, product) => {
        const diffMs =
          product.updatedAt.getTime() - product.createdAt.getTime();
        return sum + diffMs / (1000 * 60 * 60);
      }, 0);
      avgClaimTimeHours = totalHours / claimedProducts.length;
    }

    // Get nonprofit approval rate
    const nonprofitsWithApproval = await prisma.nonprofit.findMany({
      select: {
        nonprofitDocumentApproval: true,
      },
    });

    const approvedCount = nonprofitsWithApproval.filter(
      (n) => n.nonprofitDocumentApproval === true
    ).length;
    const totalWithDecision = nonprofitsWithApproval.filter(
      (n) => n.nonprofitDocumentApproval !== null
    ).length;
    const approvalRate =
      totalWithDecision > 0 ? approvedCount / totalWithDecision : 0;

    return NextResponse.json({
      totalUsers,
      usersByRole,
      totalSuppliers,
      totalNonprofits,
      totalProducts,
      productsByStatus,
      avgClaimTimeHours: Math.round(avgClaimTimeHours * 10) / 10,
      approvalRate: Math.round(approvalRate * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
}
