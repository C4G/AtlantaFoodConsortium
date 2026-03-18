'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children }) => (
    <h1 className='mb-4 mt-8 scroll-mt-20 text-3xl font-bold text-foreground first:mt-0'>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className='mb-3 mt-8 scroll-mt-20 border-b border-border pb-2 text-xl font-semibold text-foreground first:mt-0'>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className='mb-2 mt-6 scroll-mt-20 text-lg font-semibold text-foreground'>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className='mb-1 mt-4 font-semibold text-foreground'>{children}</h4>
  ),
  p: ({ children }) => (
    <p className='mb-4 leading-7 text-muted-foreground last:mb-0'>{children}</p>
  ),
  a: ({ href, children }) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-primary underline underline-offset-4 hover:text-primary/80'
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href ?? '#'}
        className='font-medium text-primary underline underline-offset-4 hover:text-primary/80'
      >
        {children}
      </Link>
    );
  },
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) return <code className={className}>{children}</code>;
    return (
      <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground'>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <div className='mb-6 overflow-hidden rounded-lg border border-border bg-muted/40'>
      <pre className='overflow-x-auto p-4 text-sm leading-relaxed'>
        {children}
      </pre>
    </div>
  ),
  blockquote: ({ children }) => (
    <blockquote className='mb-4 border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-muted-foreground'>
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className='mb-4 ml-6 list-disc space-y-1 text-muted-foreground'>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className='mb-4 ml-6 list-decimal space-y-1 text-muted-foreground'>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className='leading-7'>{children}</li>,
  table: ({ children }) => (
    <div className='mb-6 overflow-x-auto rounded-lg border border-border'>
      <table className='w-full text-sm'>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className='bg-muted/60'>{children}</thead>,
  th: ({ children }) => (
    <th className='border-b border-border px-4 py-2 text-left font-semibold text-foreground'>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className='border-b border-border px-4 py-2 text-muted-foreground'>
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className='transition-colors hover:bg-muted/30'>{children}</tr>
  ),
  hr: () => <hr className='my-8 border-border' />,
  strong: ({ children }) => (
    <strong className='font-semibold text-foreground'>{children}</strong>
  ),
  em: ({ children }) => (
    <em className='italic text-muted-foreground'>{children}</em>
  ),
};

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
