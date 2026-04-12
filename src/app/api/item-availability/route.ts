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
    const { productId, action, quantityClaimed } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Unclaim: restore product to the available pool
    if (action === 'unclaim') {
      const claimedRecord = await prisma.productRequest.findUnique({
        where: { id: productId },
        select: { originalProductId: true, quantity: true },
      });

      if (!claimedRecord) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      if (claimedRecord.originalProductId) {
        // Partial unclaim: merge quantity back into the original and delete this record
        const originalUpdated = await prisma.$transaction(async (tx) => {
          const original = await tx.productRequest.update({
            where: { id: claimedRecord.originalProductId! },
            data: { quantity: { increment: claimedRecord.quantity } },
            select: { id: true, quantity: true },
          });
          await tx.productRequest.delete({ where: { id: productId } });
          return original;
        });
        return NextResponse.json({
          merged: true,
          originalProductId: claimedRecord.originalProductId,
          updatedQuantity: originalUpdated.quantity,
        });
      }

      // Full unclaim: restore the single record to AVAILABLE
      const updatedProduct = await prisma.productRequest.update({
        where: { id: productId },
        data: {
          status: 'AVAILABLE',
          claimedById: null,
        },
        include: {
          productType: true,
          supplier: true,
          pickupInfo: true,
        },
      });
      return NextResponse.json(updatedProduct);
    }

    // Claim: fetch current product to validate quantity, status, and copy data
    const currentProduct = await prisma.productRequest.findUnique({
      where: { id: productId },
      include: {
        productType: true,
        pickupInfo: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (currentProduct.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Product is no longer available' },
        { status: 409 }
      );
    }

    // Default to claiming the full quantity when not specified
    const qty: number =
      quantityClaimed != null
        ? Number(quantityClaimed)
        : currentProduct.quantity;

    if (!Number.isInteger(qty) || qty <= 0 || qty > currentProduct.quantity) {
      return NextResponse.json(
        {
          error:
            'Invalid quantity: must be a positive integer no greater than available quantity',
        },
        { status: 400 }
      );
    }

    const isFullClaim = qty >= currentProduct.quantity;

    if (isFullClaim) {
      // Full claim: mark the original product RESERVED
      const updatedProduct = await prisma.productRequest.update({
        where: { id: productId },
        data: {
          status: 'RESERVED',
          claimedById: user.nonprofitId,
        },
        include: {
          productType: true,
          supplier: true,
          pickupInfo: true,
        },
      });
      return NextResponse.json(updatedProduct);
    }

    // Partial claim: create a new RESERVED record for the claimed portion
    // and reduce the original's quantity — all in one atomic transaction.
    const newClaim = await prisma.$transaction(async (tx) => {
      // 1. Create a new ProductType (copy of the original)
      const newProductType = await tx.productType.create({
        data: {
          protein: currentProduct.productType?.protein,
          proteinTypes: currentProduct.productType?.proteinTypes ?? [],
          otherProteinType: currentProduct.productType?.otherProteinType,
          produce: currentProduct.productType?.produce,
          produceType: currentProduct.productType?.produceType,
          shelfStable: currentProduct.productType?.shelfStable,
          shelfStableType: currentProduct.productType?.shelfStableType,
          shelfStableIndividualServing:
            currentProduct.productType?.shelfStableIndividualServing,
          shelfStableIndividualServingType:
            currentProduct.productType?.shelfStableIndividualServingType,
          alreadyPreparedFood: currentProduct.productType?.alreadyPreparedFood,
          alreadyPreparedFoodType:
            currentProduct.productType?.alreadyPreparedFoodType,
          other: currentProduct.productType?.other,
          otherType: currentProduct.productType?.otherType,
        },
      });

      // 2. Create a new PickupInfo (copy of the original) if it exists
      let newPickupInfoId: string | undefined;
      if (currentProduct.pickupInfo) {
        const newPickupInfo = await tx.pickupInfo.create({
          data: {
            pickupDate: currentProduct.pickupInfo.pickupDate,
            pickupTimeframe: currentProduct.pickupInfo.pickupTimeframe,
            pickupLocation: currentProduct.pickupInfo.pickupLocation,
            pickupInstructions: currentProduct.pickupInfo.pickupInstructions,
            contactName: currentProduct.pickupInfo.contactName,
            contactPhone: currentProduct.pickupInfo.contactPhone,
          },
        });
        newPickupInfoId = newPickupInfo.id;
      }

      // 3. Create the new RESERVED product record for the claimed portion
      const claimed = await tx.productRequest.create({
        data: {
          name: currentProduct.name,
          unit: currentProduct.unit,
          quantity: qty,
          description: currentProduct.description,
          status: 'RESERVED',
          supplierId: currentProduct.supplierId,
          claimedById: user.nonprofitId,
          productTypeId: newProductType.id,
          pickupInfoId: newPickupInfoId,
          originalProductId: productId,
        },
        include: {
          productType: true,
          supplier: true,
          pickupInfo: true,
        },
      });

      // 4. Reduce the original product's remaining quantity
      await tx.productRequest.update({
        where: { id: productId },
        data: { quantity: currentProduct.quantity - qty },
      });

      return claimed;
    });

    return NextResponse.json({
      claimed: newClaim,
      originalProductId: productId,
      remainingQuantity: currentProduct.quantity - qty,
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json(
      { error: 'Error updating product status' },
      { status: 500 }
    );
  }
}
