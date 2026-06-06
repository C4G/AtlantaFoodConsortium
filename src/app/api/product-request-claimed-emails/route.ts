import { NextResponse } from 'next/server';
import React from 'react';
import ProductRequestClaimedNotification from '@/emails/ProductRequestClaimedNotification';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'NONPROFIT') {
    return NextResponse.json(
      { error: 'Unauthorized - Nonprofit access required' },
      { status: 401 }
    );
  }

  try {
    const { productId } = await req.json();

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId is required' },
        { status: 400 }
      );
    }

    // Fetch product and related data
    const product = await prisma.productRequest.findUnique({
      where: { id: productId },
      include: {
        productType: true,
        supplier: true,
        claimingNonprofit: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.claimingNonprofit) {
      return NextResponse.json(
        { error: 'Product has not been claimed' },
        { status: 400 }
      );
    }

    // Get the first user associated with the supplier (to send the email to)
    const supplierUser = await prisma.user.findFirst({
      where: { supplierId: product.supplierId },
    });

    if (!supplierUser) {
      return NextResponse.json(
        { error: 'Supplier user not found' },
        { status: 404 }
      );
    }

    // Get the nonprofit's user for contact information
    const nonprofitUser = await prisma.user.findFirst({
      where: { nonprofitId: product.claimingNonprofit.id },
    });

    const emailHtml = React.createElement(ProductRequestClaimedNotification, {
      supplierName: product.supplier.name,
      nonprofitName: product.claimingNonprofit.name,
      productName: product.name,
      quantity: product.quantity,
      unit: product.unit,
      description: product.description,
      nonprofitContactEmail: nonprofitUser?.email ?? '',
      nonprofitContactNumber: nonprofitUser?.phoneNumber ?? '',
      nonprofitPickupContactName:
        product.nonprofitPickupContactName ?? undefined,
      nonprofitPickupContactPhone:
        product.nonprofitPickupContactPhone ?? undefined,
      nonprofitPickupDate: product.nonprofitPickupDate?.toISOString(),
      nonprofitPickupTimeframe: product.nonprofitPickupTimeframe,
    });

    const response = await resend.emails.send({
      from: 'Metro Atlanta Food Consortium <mafc-no-reply@c4g.dev>',
      to: supplierUser.email,
      subject: `Product Claimed: ${product.name}`,
      react: emailHtml,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending product claimed email:', error);
    return NextResponse.json(
      { error: 'Failed to send product claimed email' },
      { status: 500 }
    );
  }
}
