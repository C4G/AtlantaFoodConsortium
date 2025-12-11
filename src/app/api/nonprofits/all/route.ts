import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nonprofits = await prisma.nonprofit.findMany({
      include: {
        users: true,
        productsClaimed: {
          include: {
            productType: true,
            pickupInfo: true,
          },
        },
      },
    });

    return NextResponse.json(nonprofits);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching nonprofits', details: error },
      { status: 500 }
    );
  }
}
