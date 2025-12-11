import { NextResponse } from 'next/server';
import React from 'react';
import ProductRequestAvailableNotification from '@/emails/ProductRequestAvailableNotification';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PickupTimeframe } from '../../../../types/types';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'SUPPLIER') {
      return NextResponse.json(
        { error: 'Unauthorized - Supplier access required' },
        { status: 401 }
      );
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details with supplier contact info and pickup info
    const product = await prisma.productRequest.findUnique({
      where: { id: productId },
      include: {
        productType: true,
        supplier: {
          include: {
            users: {
              select: {
                email: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
        pickupInfo: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.pickupInfo) {
      return NextResponse.json(
        { error: 'Product pickup information not found' },
        { status: 404 }
      );
    }

    // Get all nonprofits with matching product interests
    const nonprofits = await prisma.nonprofit.findMany({
      where: {
        users: {
          some: {
            productSurvey: {
              OR: [
                { protein: product.productType.protein },
                { produce: product.productType.produce },
                { shelfStable: product.productType.shelfStable },
                {
                  shelfStableIndividualServing:
                    product.productType.shelfStableIndividualServing,
                },
                {
                  alreadyPreparedFood: product.productType.alreadyPreparedFood,
                },
                { other: product.productType.other },
              ],
            },
          },
        },
      },
      include: {
        users: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log('Found nonprofits to notify:', {
      productId,
      productName: product.name,
      supplierName: product.supplier.name,
      nonprofitCount: nonprofits.length,
    });

    // Get supplier contact info
    const supplierUser = product.supplier.users[0];
    if (!supplierUser) {
      return NextResponse.json(
        { error: 'Supplier contact information not found' },
        { status: 404 }
      );
    }

    const emailRequests = nonprofits
      // Filter to only nonprofits that have been approved
      .filter((nonprofit) => nonprofit.nonprofitDocumentApproval)
      .flatMap((nonprofit) =>
        nonprofit.users.map((user) => {
          const emailHtml = React.createElement(
            ProductRequestAvailableNotification,
            {
              nonprofitName: user.name || 'Valued Partner',
              supplierName: product.supplier.name,
              productName: product.name,
              quantity: product.quantity,
              unit: product.unit,
              description: product.description,
              pickupDate: product.pickupInfo!.pickupDate.toISOString(),
              pickupLocation: product.pickupInfo!.pickupLocation,
              pickupTimeframe: product.pickupInfo!
                .pickupTimeframe as PickupTimeframe[],
              pickupInstructions: product.pickupInfo!.pickupInstructions,
              supplierContactEmail: supplierUser.email,
              supplierContactNumber: supplierUser.phoneNumber || undefined,
            }
          );

          return {
            from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
            to: user.email,
            subject: `New Product Available: ${product.name}`,
            react: emailHtml,
          };
        })
      );

    await resend.batch.send(emailRequests, {
      batchValidation: 'permissive',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in product availability email:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
