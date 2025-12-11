import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus, UserRole } from '@prisma/client';

// Add interface for extended user type
interface ExtendedUser {
  id: string;
  role: UserRole;
  nonprofitId?: string;
  email: string;
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'NONPROFIT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as ProductStatus;

    if (!status || !Object.values(ProductStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Valid status parameter is required' },
        { status: 400 }
      );
    }

    const availableItems = await prisma.productRequest.findMany({
      where: {
        status: status,
      },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(availableItems);
  } catch (error) {
    console.error('Error fetching available items:', error);
    return NextResponse.json(
      { error: 'Error fetching available items' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  const user = session?.user as ExtendedUser;

  if (!user || user.role !== 'NONPROFIT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, action } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Update the product status based on the action
    const updatedProduct = await prisma.productRequest.update({
      where: {
        id: productId,
      },
      data: {
        status: action === 'unclaim' ? 'AVAILABLE' : 'RESERVED',
        claimedById: action === 'unclaim' ? null : user.nonprofitId,
      },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Error updating product status' },
      { status: 500 }
    );
  }
}
