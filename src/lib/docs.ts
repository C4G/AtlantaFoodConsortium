import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type * as PageTree from 'fumadocs-core/page-tree';

export interface DocPage {
  title: string;
  description?: string;
  group?: string;
  order?: number;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');
export const DOCS_BASE = '/documentation/features';

interface FileEntry {
  filePath: string;
  slug: string[];
}

function collectFiles(dir: string, prefix: string[] = []): FileEntry[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result: FileEntry[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;
    if (entry.isDirectory()) {
      result.push(
        ...collectFiles(path.join(dir, entry.name), [...prefix, entry.name])
      );
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const name = entry.name.slice(0, -3);
      const slug = name === 'index' ? prefix : [...prefix, name];
      result.push({ filePath: path.join(dir, entry.name), slug });
    }
  }
  return result;
}

function readDocFile(filePath: string): DocPage | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return {
      title: data.title ?? 'Untitled',
      description: data.description,
      group: data.group,
      order: data.order,
      body: content,
    };
  } catch (err) {
    console.error('[docs] Failed to parse', filePath, err);
    return null;
  }
}

export function getAllDocSlugs(): string[][] {
  return collectFiles(CONTENT_DIR).map((e) => e.slug);
}

export function getDoc(slug: string[]): DocPage | null {
  const exactPath = path.join(CONTENT_DIR, ...slug) + '.md';
  if (fs.existsSync(exactPath)) return readDocFile(exactPath);
  const indexPath = path.join(CONTENT_DIR, ...slug, 'index.md');
  if (fs.existsSync(indexPath)) return readDocFile(indexPath);
  if (slug.length === 0) {
    const rootIndex = path.join(CONTENT_DIR, 'index.md');
    if (fs.existsSync(rootIndex)) return readDocFile(rootIndex);
  }
  return null;
}

export interface SearchableDoc {
  url: string;
  title: string;
  description?: string;
  group?: string;
  textContent: string;
}

export function getAllDocsForSearch(): SearchableDoc[] {
  const files = collectFiles(CONTENT_DIR);
  const results: SearchableDoc[] = [];
  for (const { filePath, slug } of files) {
    const doc = readDocFile(filePath);
    if (!doc) continue;
    const url =
      slug.length === 0 ? DOCS_BASE : DOCS_BASE + '/' + slug.join('/');
    const plainText = doc.body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_>[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    results.push({
      url,
      title: doc.title,
      description: doc.description,
      group: doc.group,
      textContent: [doc.title, doc.description ?? '', plainText].join(' '),
    });
  }
  return results;
}

export function buildPageTree(): PageTree.Root {
  const files = collectFiles(CONTENT_DIR);
  interface NavEntry {
    title: string;
    url: string;
    order: number;
    group?: string;
  }
  const entries: NavEntry[] = [];
  for (const { filePath, slug } of files) {
    const doc = readDocFile(filePath);
    if (!doc) continue;
    const url =
      slug.length === 0 ? DOCS_BASE : DOCS_BASE + '/' + slug.join('/');
    entries.push({
      title: doc.title,
      url,
      order: doc.order ?? 999,
      group: doc.group,
    });
  }
  entries.sort((a, b) => a.order - b.order);
  const ungrouped: PageTree.Item[] = [];
  const groupMap = new Map<string, PageTree.Item[]>();
  for (const entry of entries) {
    const item: PageTree.Item = {
      type: 'page',
      name: entry.title,
      url: entry.url,
    };
    if (entry.group) {
      if (!groupMap.has(entry.group)) groupMap.set(entry.group, []);
      groupMap.get(entry.group)!.push(item);
    } else {
      ungrouped.push(item);
    }
  }
  const sortedGroups = [...groupMap.keys()].sort((a, b) => {
    if (a === 'Introduction') return -1;
    if (b === 'Introduction') return 1;
    return a.localeCompare(b);
  });
  const children: PageTree.Node[] = [...ungrouped];
  for (const groupName of sortedGroups) {
    children.push({
      type: 'folder',
      name: groupName,
      defaultOpen: true,
      children: groupMap.get(groupName)!,
    } as PageTree.Folder);
  }
  return { name: 'Docs', children };
}
