import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productInterestsId } = await req.json();

  try {
    if (!productInterestsId) {
      return NextResponse.json(
        { error: 'Product interests ID is required' },
        { status: 400 }
      );
    }

    const productInterests = await prisma.productInterests.findUnique({
      where: {
        id: productInterestsId,
      },
      include: {
        users: true,
      },
    });
    return NextResponse.json(productInterests);
  } catch (error) {
    console.error('Error fetching product interests:', error);
    return NextResponse.json(
      { error: 'Error fetching product interests' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productInterestProfile } = await req.json();

    const productInterests = await prisma.productInterests.create({
      data: productInterestProfile,
      include: {
        users: true,
      },
    });
    return NextResponse.json(productInterests);
  } catch (error) {
    console.error('Error creating product interests:', error);
    return NextResponse.json(
      { error: 'Error creating product interests' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productInterestsProfile } = await req.json();

    const productInterests = await prisma.productInterests.update({
      where: {
        id: productInterestsProfile.id,
      },
      data: productInterestsProfile,
      include: {
        users: true,
      },
    });
    return NextResponse.json(productInterests);
  } catch (error) {
    console.error('Error updating product interests:', error);
    return NextResponse.json(
      { error: 'Error updating product interests' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productInterestsId } = await req.json();

  if (!productInterestsId) {
    return NextResponse.json(
      { error: 'Product interests ID is required' },
      { status: 400 }
    );
  }

  try {
    const deletedProductInterests = await prisma.productInterests.delete({
      where: {
        id: productInterestsId,
      },
    });
    return NextResponse.json(deletedProductInterests);
  } catch (error) {
    console.error('Error deleting product interests:', error);
    return NextResponse.json(
      { error: 'Error deleting product interests' },
      { status: 500 }
    );
  }
}
