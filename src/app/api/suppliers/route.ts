import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { supplierId } = await req.json();

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: supplierId,
      },
      include: {
        users: true,
        products: true,
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier(s):', error);
    return NextResponse.json(
      { error: 'Error fetching supplier(s)' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supplier = await req.json();

  try {
    const newSupplier = await prisma.supplier.create({
      data: supplier,
      include: {
        users: true,
        products: true,
      },
    });
    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Error creating supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supplier = await req.json();

  try {
    const updatedSupplier = await prisma.supplier.update({
      where: {
        id: supplier.id,
      },
      data: supplier,
      include: {
        users: true,
        products: true,
      },
    });
    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Error updating supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { supplierId } = await req.json();

  if (!supplierId) {
    return NextResponse.json(
      { error: 'Supplier ID is required' },
      { status: 400 }
    );
  }

  try {
    await prisma.supplier.delete({
      where: {
        id: supplierId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Error deleting supplier' },
      { status: 500 }
    );
  }
}
