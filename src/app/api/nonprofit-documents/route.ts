import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'nonprofit-documents');

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await prisma.nonprofitDocument.findMany({
      select: {
        id: true,
        fileName: true,
        fileType: true,
        filePath: true,
        uploadedAt: true,
        nonprofit: {
          select: {
            id: true,
            name: true,
            organizationType: true,
          },
        },
      },
    });

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      );
    }

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Error fetching documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== 'NONPROFIT') {
      return NextResponse.json(
        { error: 'Only nonprofit users can upload documents' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image file.' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    if (!user.nonprofitId) {
      return NextResponse.json(
        { error: 'User does not belong to nonprofit' },
        { status: 403 }
      );
    }
    const nonprofit = await prisma.nonprofit.findUnique({
      where: { id: user.nonprofitId },
    });

    if (!nonprofit?.nonprofitDocumentId) {
      return NextResponse.json(
        { error: 'No document found for nonprofit' },
        { status: 404 }
      );
    }
    const nonprofitDocumentId = nonprofit.nonprofitDocumentId;

    const existingDocument = await prisma.nonprofitDocument.findUnique({
      where: { id: nonprofitDocumentId },
    });

    // Write new file to disk
    await mkdir(UPLOAD_DIR, { recursive: true });
    const diskFileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, diskFileName);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    let document;
    if (existingDocument) {
      // Delete the old file from disk when replacing
      if (existingDocument.filePath) {
        try {
          await unlink(existingDocument.filePath);
        } catch {
          // Ignore – file may already be gone
        }
      }

      document = await prisma.nonprofitDocument.update({
        where: { id: existingDocument.id },
        data: {
          fileName: file.name,
          fileType: file.type,
          filePath,
          fileData: null, // clear any legacy blob
        },
      });
    } else {
      document = await prisma.nonprofitDocument.create({
        data: {
          fileName: file.name,
          fileType: file.type,
          filePath,
        },
      });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Error uploading document' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { nonprofit: true },
    });

    if (!user?.nonprofit) {
      return NextResponse.json(
        { error: 'Nonprofit not found' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or image file.' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Fetch the current document so we can delete the old file from disk
    const currentDoc = await prisma.nonprofitDocument.findUnique({
      where: { id: user.nonprofit.nonprofitDocumentId },
    });

    // Write new file to disk
    await mkdir(UPLOAD_DIR, { recursive: true });
    const diskFileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, diskFileName);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Delete the old file from disk when replacing
    if (currentDoc?.filePath) {
      try {
        await unlink(currentDoc.filePath);
      } catch {
        // Ignore, may already be gone
      }
    }

    // Update document and reset approval status
    const updatedNonprofit = await prisma.nonprofit.update({
      where: { id: user.nonprofit.id },
      data: {
        nonprofitDocument: {
          update: {
            fileName: file.name,
            fileType: file.type,
            filePath,
            fileData: null, // clear any legacy blob
            uploadedAt: new Date(),
          },
        },
        nonprofitDocumentApproval: null, // Reset to pending
      },
      include: {
        nonprofitDocument: true,
      },
    });

    return NextResponse.json(updatedNonprofit);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Error updating document' },
      { status: 500 }
    );
  }
}
