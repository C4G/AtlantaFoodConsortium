import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import cuid from 'cuid';

async function parseLargeJsonBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error('No request body found');

  const chunks = [];
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }

  const fullBuffer = Buffer.concat(chunks);
  const rawBody = fullBuffer.toString('utf-8');
  return JSON.parse(rawBody);
}

export async function GET() {
  try {
    const session = await auth();

    if (
      !session ||
      !session.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPLIER')
    ) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await req.json();
    user.supplier = user.supplier || {};
    user.nonprofit = user.nonprofit || {};
    user.productSurvey = user.productSurvey || {};

    const newUser = await prisma.user.create({
      data: user,
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    const userId = user?.id;
    const userData = await parseLargeJsonBody(req);
    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    if (userId && userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const documentData = userData.nonprofit?.create?.nonprofitDocument?.create;

    const fileBuffer = documentData?.fileData
      ? Buffer.from(Object.values(documentData.fileData) as number[])
      : null;

    const documentId = cuid();

    if (userData.nonprofit?.create) {
      if (userData.nonprofit.create.nonprofitDocument?.create) {
        userData.nonprofit.create.nonprofitDocument.create = {
          ...userData.nonprofit.create.nonprofitDocument.create,
          id: documentId,
          fileData: fileBuffer,
        };
      }
      userData.nonprofit.create.nonprofitDocumentApproval = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate that user can only delete their own data unless they are an admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      include: {
        supplier: true,
        nonprofit: true,
        productSurvey: true,
      },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
