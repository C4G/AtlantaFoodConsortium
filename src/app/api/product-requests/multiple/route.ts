import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPLIER')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const productRequests = await prisma.productRequest.findMany({
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });

    return NextResponse.json(productRequests);
  } catch (error) {
    console.error('Error fetching product requests:', error);
    return NextResponse.json(
      { error: 'Error fetching product requests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPLIER')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const products = await req.json();

  try {
    const newProducts = await prisma.$transaction(
      //eslint-disable-next-line
      products.map((product: any) =>
        prisma.productRequest.create({
          data: product,
          include: {
            productType: true,
            supplier: true,
            pickupInfo: true,
            claimingNonprofit: true,
          },
        })
      )
    );
    return NextResponse.json(newProducts);
  } catch (error) {
    console.error('Error creating products:', error);
    return NextResponse.json(
      { error: 'Error creating products' },
      { status: 500 }
    );
  }
}
