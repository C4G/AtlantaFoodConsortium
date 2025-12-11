import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productTypeId } = await req.json();

    if (!productTypeId) {
      return NextResponse.json(
        { error: 'Product type ID is required' },
        { status: 400 }
      );
    }

    const productType = await prisma.productType.findUnique({
      where: {
        id: productTypeId,
      },
      include: {
        product: true,
      },
    });
    return NextResponse.json(productType);
  } catch (error) {
    console.error('Error fetching product type(s):', error);
    return NextResponse.json(
      { error: 'Error fetching product type(s)' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const productType = await req.json();

  try {
    const newProductType = await prisma.productType.create({
      data: productType,
      include: {
        product: true,
      },
    });
    return NextResponse.json(newProductType);
  } catch (error) {
    console.error('Error creating product type:', error);
    return NextResponse.json(
      { error: 'Error creating product type' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const productType = await req.json();

  try {
    const updatedProductType = await prisma.productType.update({
      where: { id: productType.id },
      data: productType,
      include: {
        product: true,
      },
    });
    return NextResponse.json(updatedProductType);
  } catch (error) {
    console.error('Error updating product type:', error);
    return NextResponse.json(
      { error: 'Error updating product type' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productTypeId } = await req.json();

    if (!productTypeId) {
      return NextResponse.json(
        { error: 'Product type ID is required' },
        { status: 400 }
      );
    }

    const deletedProductType = await prisma.productType.delete({
      where: { id: productTypeId },
    });
    return NextResponse.json(deletedProductType);
  } catch (error) {
    console.error('Error deleting product type:', error);
    return NextResponse.json(
      { error: 'Error deleting product type' },
      { status: 500 }
    );
  }
}
