import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPLIER')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }

    const products = await prisma.productRequest.findMany({
      where: {
        supplierId: supplierId,
      },
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await req.json();

  try {
    const newProduct = await prisma.productRequest.create({
      data: product,
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const product = await req.json();

  try {
    const updatedProduct = await prisma.productRequest.update({
      where: { id: product.id },
      data: product,
      include: {
        productType: true,
        supplier: true,
        pickupInfo: true,
        claimingNonprofit: true,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPLIER')
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { product } = await req.json();

  if (!product) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }

  try {
    const deletedProduct = await prisma.productRequest.delete({
      where: { id: product.id },
    });
    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
}
