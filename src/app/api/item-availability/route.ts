import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus, UserRole } from '../../../generated/prisma/client';

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
      // Check if this nonprofit already has an open partial claim on this product.
      // If so, merging the remaining qty into that record keeps My Claims as one card.
      const existingPartialClaim = await prisma.productRequest.findFirst({
        where: {
          originalProductId: productId,
          claimedById: user.nonprofitId,
          status: 'RESERVED',
        },
      });

      if (existingPartialClaim) {
        // The original product is now fully claimed: absorb it into the existing
        // partial claim record, then delete the original so it disappears from
        // the available list and never shows as a second card.
        const mergedClaim = await prisma.$transaction(async (tx) => {
          // 1. Add remaining qty to the existing partial claim and detach it
          //    (originalProductId = null) so unclaim treats it as a full claim.
          const updated = await tx.productRequest.update({
            where: { id: existingPartialClaim.id },
            data: { quantity: { increment: qty }, originalProductId: null },
            include: { productType: true, supplier: true, pickupInfo: true },
          });
          // 2. Delete the now-fully-consumed original product record.
          await tx.productRequest.delete({ where: { id: productId } });
          // 3. Clean up the original's orphaned ProductType and PickupInfo.
          if (currentProduct.productTypeId) {
            await tx.productType.delete({
              where: { id: currentProduct.productTypeId },
            });
          }
          if (currentProduct.pickupInfoId) {
            await tx.pickupInfo.delete({
              where: { id: currentProduct.pickupInfoId },
            });
          }
          return updated;
        });
        return NextResponse.json({
          claimed: mergedClaim,
          originalProductId: productId,
          remainingQuantity: 0,
        });
      }

      // No existing partial claim: standard full claim — mark the original RESERVED.
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

    // Partial claim: merge into existing partial claim or create a new one,
    // then reduce the original's remaining quantity — all in one atomic transaction.
    const claimedRecord = await prisma.$transaction(async (tx) => {
      // Check if this nonprofit already has an open partial claim for this product
      const existingClaim = await tx.productRequest.findFirst({
        where: {
          originalProductId: productId,
          claimedById: user.nonprofitId,
          status: 'RESERVED',
        },
        include: { productType: true, supplier: true, pickupInfo: true },
      });

      // Reduce the original product's remaining quantity
      await tx.productRequest.update({
        where: { id: productId },
        data: { quantity: currentProduct.quantity - qty },
      });

      if (existingClaim) {
        // Merge: increment the existing partial claim's quantity
        return tx.productRequest.update({
          where: { id: existingClaim.id },
          data: { quantity: { increment: qty } },
          include: { productType: true, supplier: true, pickupInfo: true },
        });
      }

      // No existing claim — create a new RESERVED record for the claimed portion
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
      return tx.productRequest.create({
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
    });

    return NextResponse.json({
      claimed: claimedRecord,
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
