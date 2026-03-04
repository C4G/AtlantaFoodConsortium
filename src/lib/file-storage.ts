import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

if (!process.env.FILE_UPLOADS) {
  throw new Error('FILE_UPLOADS environment variable is not set');
}

/** Root directory for all nonprofit document uploads. */
export const NONPROFIT_DOCUMENTS_DIR = path.join(
  process.env.FILE_UPLOADS,
  'nonprofit-documents'
);

export const VALID_DOCUMENT_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Returns an error message string, or null if the file is valid. */
export function validateDocumentFile(file: File): string | null {
  if (!VALID_DOCUMENT_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a PDF or image file.';
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return 'File size must be less than 5MB';
  }
  return null;
}

/** Generates a filename with a YYYYMMDDHHmmss timestamp prefix. */
export function generateTimestampedFileName(originalName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `${timestamp}-${originalName}`;
}

/** Generates a filename with the prefix. Should be an ID here*/
export function generatePrefixedFileName(
  prefix: string,
  originalName: string
): string {
  return `${prefix}-${originalName}`;
}

/**
 * Ensures `dir` exists, writes `buffer` to `dir/fileName`, and returns the
 * full absolute path of the written file.
 */
export async function writeFileToDisk(
  dir: string,
  fileName: string,
  buffer: Buffer
): Promise<string> {
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, buffer);
  return filePath;
}

/** Deletes a file from disk */
export async function deleteFileSafely(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    // Ignore
  }
}
