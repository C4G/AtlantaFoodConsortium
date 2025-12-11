import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'NONPROFIT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productSurveyId = searchParams.get('productSurveyId');

    if (!productSurveyId) {
      return NextResponse.json(
        { error: 'Product Survey ID is required' },
        { status: 400 }
      );
    }

    const nonprofitInterests = await prisma.productInterests.findUnique({
      where: {
        id: productSurveyId,
      },
    });

    if (!nonprofitInterests) {
      return NextResponse.json(
        { error: 'Nonprofit interests not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(nonprofitInterests);
  } catch (error) {
    console.error('Error fetching nonprofit interests:', error);
    return NextResponse.json(
      { error: 'Error fetching nonprofit interests' },
      { status: 500 }
    );
  }
}
