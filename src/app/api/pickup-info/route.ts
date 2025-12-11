import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pickupInfoId } = await req.json();

    if (!pickupInfoId) {
      return NextResponse.json(
        { error: 'Pickup info ID is required' },
        { status: 400 }
      );
    }

    const pickupInfo = await prisma.pickupInfo.findUnique({
      where: {
        id: pickupInfoId,
      },
      include: {
        product: true,
      },
    });
    return NextResponse.json(pickupInfo);
  } catch (error) {
    console.error('Error fetching pickup info:', error);
    return NextResponse.json(
      { error: 'Error fetching pickup info' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pickupInfo = await req.json();

  try {
    const newPickupInfo = await prisma.pickupInfo.create({
      data: pickupInfo,
      include: {
        product: true,
      },
    });
    return NextResponse.json(newPickupInfo);
  } catch (error) {
    console.error('Error creating pickup info:', error);
    return NextResponse.json(
      { error: 'Error creating pickup info' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pickupInfo = await req.json();

  try {
    const updatedPickupInfo = await prisma.pickupInfo.update({
      where: { id: pickupInfo.id },
      data: pickupInfo,
      include: {
        product: true,
      },
    });
    return NextResponse.json(updatedPickupInfo);
  } catch (error) {
    console.error('Error updating pickup info:', error);
    return NextResponse.json(
      { error: 'Error updating pickup info' },
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
    const { pickupInfoId } = await req.json();

    if (!pickupInfoId) {
      return NextResponse.json(
        { error: 'Pickup info ID is required' },
        { status: 400 }
      );
    }

    const deletedPickupInfo = await prisma.pickupInfo.delete({
      where: { id: pickupInfoId },
    });
    return NextResponse.json(deletedPickupInfo);
  } catch (error) {
    console.error('Error deleting pickup info:', error);
    return NextResponse.json(
      { error: 'Error deleting pickup info' },
      { status: 500 }
    );
  }
}
