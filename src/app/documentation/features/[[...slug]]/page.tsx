import { notFound } from 'next/navigation';
import { getDoc, getAllDocSlugs, DOCS_BASE } from '@/lib/docs';
import MarkdownContent from '@/components/docs/MarkdownContent';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return [
    { slug: undefined }, // root /documentation/features
    ...slugs.filter((s) => s.length > 0).map((s) => ({ slug: s })),
  ];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} — Feature Docs`,
    description: doc.description,
  };
}

export default async function FeatureDocPage({ params }: PageProps) {
  const { slug = [] } = await params;
  const doc = getDoc(slug);

  if (!doc) notFound();

  // Build breadcrumb segments
  const crumbs: { label: string; href: string }[] = [
    { label: 'Feature Docs', href: DOCS_BASE },
  ];
  if (slug.length > 0) {
    for (let i = 0; i < slug.length; i++) {
      crumbs.push({
        label: slug[i].replace(/-/g, ' '),
        href: `${DOCS_BASE}/${slug.slice(0, i + 1).join('/')}`,
      });
    }
  }

  return (
    <article className='mx-auto max-w-3xl'>
      {/* Breadcrumb */}
      {slug.length > 0 && (
        <nav className='mb-6 flex items-center gap-1.5 text-sm text-muted-foreground'>
          {crumbs.map((crumb, i) => (
            <span key={i} className='flex items-center gap-1.5'>
              {i > 0 && <span className='text-muted-foreground/40'>/</span>}
              {i < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className='capitalize hover:text-foreground'
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className='capitalize text-foreground'>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Page header */}
      <header className='mb-8 border-b border-border pb-6'>
        <h1 className='mb-3 text-3xl font-bold tracking-tight text-foreground'>
          {doc.title}
        </h1>
        {doc.description && (
          <p className='text-lg leading-relaxed text-muted-foreground'>
            {doc.description}
          </p>
        )}
      </header>

      {/* Content */}
      <MarkdownContent content={doc.body} />

      {/* Footer nav */}
      {slug.length > 0 && (
        <footer className='mt-12 border-t border-border pt-6'>
          <Link
            href={DOCS_BASE}
            className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ChevronLeft className='h-4 w-4' />
            Back to Feature Docs
          </Link>
        </footer>
      )}
    </article>
  );
}
