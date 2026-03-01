import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const document = await prisma.nonprofitDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const contentDisposition = `attachment; filename="${document.fileName}"`;

    // New records: serve from filesystem
    if (document.filePath) {
      let fileBuffer: Buffer;
      try {
        fileBuffer = await readFile(document.filePath);
      } catch {
        return NextResponse.json(
          { error: 'File not found on server' },
          { status: 404 }
        );
      }

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': document.fileType,
          'Content-Disposition': contentDisposition,
          'Content-Length': String(fileBuffer.byteLength),
        },
      });
    }

    // Legacy records: fall back to fileData blob stored in the database
    if (document.fileData) {
      const fileBuffer = Buffer.from(document.fileData);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': document.fileType,
          'Content-Disposition': contentDisposition,
          'Content-Length': String(fileBuffer.byteLength),
        },
      });
    }

    return NextResponse.json(
      { error: 'No file data available for this document' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Error downloading document' },
      { status: 500 }
    );
  }
}
