/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    nonprofitDocument: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

function makeRequest(id?: string): Request {
  const url = id
    ? `http://localhost/api/nonprofit-documents/download?id=${id}`
    : 'http://localhost/api/nonprofit-documents/download';
  return new Request(url);
}

describe('GET /api/nonprofit-documents/download', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await GET(makeRequest('doc1'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 for non-ADMIN roles', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'NONPROFIT' },
    } as any);

    const res = await GET(makeRequest('doc1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 when id query param is missing', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Document ID is required/);
  });

  it('returns 404 when document is not in the database', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue(null);

    const res = await GET(makeRequest('missing-id'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/Document not found/);
  });

  it('serves the file from disk for new records (filePath)', async () => {
    const { readFile } = await import('fs/promises');
    const fileBytes = Buffer.from('%PDF-1.4 content');

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      fileName: 'cert.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/nonprofit-documents/ts-cert.pdf',
      fileData: null,
    } as any);
    vi.mocked(readFile).mockResolvedValue(fileBytes as any);

    const res = await GET(makeRequest('doc1'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('cert.pdf');
    expect(readFile).toHaveBeenCalledWith(
      '/uploads/nonprofit-documents/ts-cert.pdf'
    );
    const body = Buffer.from(await res.arrayBuffer());
    expect(body).toEqual(fileBytes);
  });

  it('returns 404 when filePath exists in DB but file is missing on disk', async () => {
    const { readFile } = await import('fs/promises');

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc1',
      fileName: 'cert.pdf',
      fileType: 'application/pdf',
      filePath: '/uploads/nonprofit-documents/deleted-cert.pdf',
      fileData: null,
    } as any);
    vi.mocked(readFile).mockRejectedValue(
      Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    );

    const res = await GET(makeRequest('doc1'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/File not found on server/);
  });

  it('falls back to legacy fileData blob when filePath is null', async () => {
    const { readFile } = await import('fs/promises');
    const fileBytes = Buffer.from('legacy PDF bytes');

    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc2',
      fileName: 'legacy.pdf',
      fileType: 'application/pdf',
      filePath: null,
      fileData: fileBytes,
    } as any);

    const res = await GET(makeRequest('doc2'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('legacy.pdf');
    expect(readFile).not.toHaveBeenCalled();
    const body = Buffer.from(await res.arrayBuffer());
    expect(body).toEqual(fileBytes);
  });

  it('returns 404 when both filePath and fileData are absent', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.nonprofitDocument.findUnique).mockResolvedValue({
      id: 'doc3',
      fileName: 'empty.pdf',
      fileType: 'application/pdf',
      filePath: null,
      fileData: null,
    } as any);

    const res = await GET(makeRequest('doc3'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toMatch(/No file data available/);
  });
});
