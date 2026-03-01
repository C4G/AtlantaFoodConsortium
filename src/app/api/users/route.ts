import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import cuid from 'cuid';
import type { Prisma } from '@prisma/client';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'nonprofit-documents');

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

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.user.role === 'ADMIN') {
      const users = await prisma.user.findMany({
        include: {
          supplier: true,
          nonprofit: true,
          productSurvey: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(users);
    }

    if (session.user.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
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

    const userData = await req.json();

    const createData: Prisma.UserUncheckedCreateInput = userData;

    const newUser = await prisma.user.create({
      data: createData,
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

    const userData = await parseLargeJsonBody(req);
    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    const userId = userData.id || session.user.id;

    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      userId === session.user.id &&
      userData.role !== undefined &&
      userData.role !== targetUser.role &&
      targetUser.role !== null
    ) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 403 }
      );
    }

    // Handle nonprofit document uploads
    if (userData.nonprofit?.create) {
      const documentData = userData.nonprofit.create.nonprofitDocument?.create;
      const documentId = cuid();

      if (userData.nonprofit.create.nonprofitDocument?.create) {
        let filePath: string | undefined;

        if (documentData?.fileData) {
          const fileBuffer = Buffer.from(
            Object.values(documentData.fileData) as number[]
          );
          await mkdir(UPLOAD_DIR, { recursive: true });
          const diskFileName = `${documentId}-${documentData.fileName || 'document'}`;
          filePath = path.join(UPLOAD_DIR, diskFileName);
          await writeFile(filePath, fileBuffer);
        }

        userData.nonprofit.create.nonprofitDocument.create = {
          id: documentId,
          fileName: documentData?.fileName,
          fileType: documentData?.fileType,
          filePath,
        };
      }
      userData.nonprofit.create.nonprofitDocumentApproval = null;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: userData as Prisma.UserUpdateInput,
        include: {
          supplier: true,
          nonprofit: true,
          productSurvey: true,
        },
      });
      return NextResponse.json(updatedUser);
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {
      name: userData.name,
      title: userData.title,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      website: userData.website,
      image: userData.image,
      role: userData.role,
      supplierId: userData.supplierId,
      nonprofitId: userData.nonprofitId,
      productSurveyId: userData.productSurveyId,
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
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

export const PUT = PATCH;
