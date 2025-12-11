import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const nonprofitId = searchParams.get('nonprofitId');
    if (!nonprofitId) {
      return NextResponse.json(
        { error: 'Nonprofit ID is required' },
        { status: 400 }
      );
    }

    // First check if the nonprofit exists
    const nonprofitExists = await prisma.nonprofit.findFirst({
      where: {
        id: nonprofitId,
      },
    });

    if (!nonprofitExists) {
      return NextResponse.json(
        { error: `Nonprofit not found with ID: ${nonprofitId}` },
        { status: 404 }
      );
    }

    // If exists, get full details
    const nonprofit = await prisma.nonprofit.findUnique({
      where: {
        id: nonprofitId,
      },
      include: {
        productsClaimed: {
          include: {
            productType: true,
            pickupInfo: true,
          },
        },
      },
    });

    return NextResponse.json(nonprofit);
  } catch (error) {
    console.error('Error in nonprofits GET route:', error);
    return NextResponse.json(
      { error: 'Error fetching nonprofit', details: error },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nonprofit } = await req.json();

  try {
    const createdNonprofit = await prisma.nonprofit.create({
      data: nonprofit,
      include: {
        nonprofitDocument: true,
        users: true,
        productsClaimed: true,
      },
    });
    return NextResponse.json(createdNonprofit);
  } catch (error) {
    console.error('Error creating nonprofit:', error);
    return NextResponse.json(
      { error: 'Error creating nonprofit' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nonprofit } = await req.json();

  try {
    const updatedNonprofit = await prisma.nonprofit.update({
      where: {
        id: nonprofit.id,
      },
      data: nonprofit,
      include: {
        nonprofitDocument: true,
        users: true,
        productsClaimed: true,
      },
    });
    return NextResponse.json(updatedNonprofit);
  } catch (error) {
    console.error('Error updating nonprofit:', error);
    return NextResponse.json(
      { error: 'Error updating nonprofit' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nonprofitId } = await req.json();

  try {
    const deletedNonprofit = await prisma.nonprofit.delete({
      where: {
        id: nonprofitId,
      },
    });
    return NextResponse.json(deletedNonprofit);
  } catch (error) {
    console.error('Error deleting nonprofit:', error);
    return NextResponse.json(
      { error: 'Error deleting nonprofit' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { nonprofitId, approved } = await req.json();

    const updatedNonprofit = await prisma.nonprofit.update({
      where: {
        id: nonprofitId,
      },
      data: {
        nonprofitDocumentApproval: approved,
      },
    });

    return NextResponse.json(updatedNonprofit);
  } catch (error) {
    console.error('Error updating nonprofit approval:', error);
    return NextResponse.json(
      { error: 'Failed to update nonprofit approval status' },
      { status: 500 }
    );
  }
}
