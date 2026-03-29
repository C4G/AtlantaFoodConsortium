import { NextRequest, NextResponse } from 'next/server';
import { getAllDocsForSearch } from '@/lib/docs';

export interface SearchResult {
  url: string;
  title: string;
  description?: string;
  group?: string;
  excerpt: string;
}

function getExcerpt(text: string, query: string, maxLen = 130): string {
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const idx = lower.indexOf(queryLower);

  if (idx === -1) {
    return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '');
  }

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 90);
  let excerpt = text.slice(start, end);
  if (start > 0) excerpt = '…' + excerpt;
  if (end < text.length) excerpt += '…';
  return excerpt;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (q.length < 2) return NextResponse.json([]);

  const docs = getAllDocsForSearch();
  const queryLower = q.toLowerCase();

  const results: SearchResult[] = docs
    .filter(
      (doc) =>
        doc.title.toLowerCase().includes(queryLower) ||
        (doc.description?.toLowerCase().includes(queryLower) ?? false) ||
        doc.textContent.toLowerCase().includes(queryLower)
    )
    .slice(0, 8)
    .map((doc) => ({
      url: doc.url,
      title: doc.title,
      description: doc.description,
      group: doc.group,
      excerpt: getExcerpt(doc.textContent, q),
    }));

  return NextResponse.json(results);
}
