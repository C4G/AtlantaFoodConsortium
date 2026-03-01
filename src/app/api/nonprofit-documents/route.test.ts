/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    nonprofitDocument: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    nonprofit: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn(),
}));

function makeFormDataRequest(
  file: File,
  url = 'http://localhost/api/nonprofit-documents'
): Request {
  const formData = new FormData();
  formData.append('file', file);
  return new Request(url, { method: 'POST', body: formData });
}

function makeFile(
  name = 'test.pdf',
  type = 'application/pdf',
  sizeBytes = 1024
): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe('GET /api/nonprofit-documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for non-ADMIN role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 when no documents exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findMany).mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(404);
  });

  it('returns documents with filePath included', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);

    const mockDocs = [
      {
        id: 'doc1',
        fileName: 'cert.pdf',
        fileType: 'application/pdf',
        filePath: '/uploads/nonprofit-documents/123-cert.pdf',
        uploadedAt: new Date('2026-01-01'),
        nonprofit: {
          id: 'np1',
          name: 'Food Bank',
          organizationType: 'FOOD_BANK',
        },
      },
    ];
    vi.mocked(prisma.nonprofitDocument.findMany).mockResolvedValue(
      mockDocs as any
    );

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body[0].filePath).toBe('/uploads/nonprofit-documents/123-cert.pdf');
    expect(body[0]).not.toHaveProperty('fileData');
  });

  it('never returns fileData bytes - downloads go through the dedicated endpoint', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);

    const mockDocs = [
      {
        id: 'doc2',
        fileName: 'legacy.pdf',
        fileType: 'application/pdf',
        filePath: null,
        uploadedAt: new Date('2025-01-01'),
        nonprofit: null,
      },
    ];
    vi.mocked(prisma.nonprofitDocument.findMany).mockResolvedValue(
      mockDocs as any
    );

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body[0]).not.toHaveProperty('fileData');
  });
});

describe('POST /api/nonprofit-documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for non-ADMIN session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);

    const req = makeFormDataRequest(makeFile());
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is provided', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      role: 'NONPROFIT',
      nonprofitId: 'np1',
    } as any);

    const emptyForm = new FormData();
    const req = new Request('http://localhost/api/nonprofit-documents', {
      method: 'POST',
      body: emptyForm,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid file type', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      role: 'NONPROFIT',
      nonprofitId: 'np1',
    } as any);

    const req = makeFormDataRequest(
      makeFile('dangerousFile.exe', 'application/x-msdownload')
    );
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid file type/);
  });

  it('creates a new document record with filePath when none exists', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      role: 'NONPROFIT',
      nonprofitId: 'np1',
    } as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      id: 'np1',
      nonprofitDocumentId: 'doc1',
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue(null);
    const createdDoc = {
      id: 'doc1',
      fileName: 'cert.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/nonprofit-documents/xxx-cert.pdf',
    };
    vi.mocked(prisma.nonprofitDocument.create).mockResolvedValue(
      createdDoc as any
    );

    const req = makeFormDataRequest(makeFile('cert.pdf'));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.nonprofitDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fileName: 'cert.pdf',
          fileType: 'application/pdf',
          filePath: expect.stringContaining('cert.pdf'),
        }),
      })
    );
    const createArg = vi.mocked(prisma.nonprofitDocument.create).mock
      .calls[0][0];
    expect((createArg.data as any).fileData).toBeUndefined();
  });

  it('updates an existing document record and stores filePath, clears fileData', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      role: 'NONPROFIT',
      nonprofitId: 'np1',
    } as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      id: 'np1',
      nonprofitDocumentId: 'doc1',
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      filePath: null,
      fileData: Buffer.from('old bytes'),
    } as any);
    const updatedDoc = {
      id: 'doc1',
      fileName: 'new.pdf',
      filePath: '/uploads/new.pdf',
      fileData: null,
    };
    vi.mocked(prisma.nonprofitDocument.update).mockResolvedValue(
      updatedDoc as any
    );

    const req = makeFormDataRequest(makeFile('new.pdf'));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(prisma.nonprofitDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          filePath: expect.stringContaining('new.pdf'),
          fileData: null,
        }),
      })
    );
  });

  it('deletes the old file from disk when replacing an existing filePath', async () => {
    const { unlink } = await import('fs/promises');

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      role: 'NONPROFIT',
      nonprofitId: 'np1',
    } as any);
    vi.mocked(prisma.nonprofit.findUnique).mockResolvedValue({
      id: 'np1',
      nonprofitDocumentId: 'doc1',
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      filePath: '/uploads/nonprofit-documents/old-cert.pdf',
      fileData: null,
    } as any);
    vi.mocked(prisma.nonprofitDocument.update).mockResolvedValue({} as any);

    const req = makeFormDataRequest(makeFile('new.pdf'));
    await POST(req);

    expect(unlink).toHaveBeenCalledWith(
      '/uploads/nonprofit-documents/old-cert.pdf'
    );
  });
});

describe('PATCH /api/nonprofit-documents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const req = makeFormDataRequest(makeFile());
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when user has no nonprofit', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      nonprofit: null,
    } as any);

    const req = makeFormDataRequest(makeFile());
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid file type', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      nonprofit: { id: 'np1', nonprofitDocumentId: 'doc1' },
    } as any);

    const req = makeFormDataRequest(makeFile('script.js', 'text/javascript'));
    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid file type/);
  });

  it('writes new file to disk, stores filePath, and resets approval', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      nonprofit: { id: 'np1', nonprofitDocumentId: 'doc1' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      filePath: null,
      fileData: null,
    } as any);
    const updatedResult = {
      id: 'np1',
      nonprofitDocument: {
        filePath: '/uploads/nonprofit-documents/ts-renewal.pdf',
      },
    };
    vi.mocked(prisma.nonprofit.update).mockResolvedValue(updatedResult as any);

    const req = makeFormDataRequest(makeFile('renewal.pdf'));
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    expect(prisma.nonprofit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nonprofitDocument: {
            update: expect.objectContaining({
              filePath: expect.stringContaining('renewal.pdf'),
              fileData: null,
            }),
          },
          nonprofitDocumentApproval: null,
        }),
      })
    );
  });

  it('deletes the old file from disk on PATCH', async () => {
    const { unlink } = await import('fs/promises');

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      nonprofit: { id: 'np1', nonprofitDocumentId: 'doc1' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      filePath: '/uploads/nonprofit-documents/old-renewal.pdf',
      fileData: null,
    } as any);
    vi.mocked(prisma.nonprofit.update).mockResolvedValue({} as any);

    const req = makeFormDataRequest(makeFile('renewal2.pdf'));
    await PATCH(req);

    expect(unlink).toHaveBeenCalledWith(
      '/uploads/nonprofit-documents/old-renewal.pdf'
    );
  });
});
