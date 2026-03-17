import type { ReactNode } from 'react';
import DocsSidebar from '@/components/docs/DocsSidebar';
import DocsSearch from '@/components/docs/DocsSearch';
import { buildPageTree, DOCS_BASE } from '@/lib/docs';

interface Props {
  children: ReactNode;
}

export default function FeaturesDocsLayout({ children }: Props) {
  const tree = buildPageTree();

  return (
    <div className='min-h-screen bg-background'>
      {/* Top bar */}
      <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex h-14 items-center gap-4 px-4 md:px-6'>
          <span className='text-sm font-medium text-muted-foreground'>
            Atlanta Food Consortium
          </span>
          <span className='text-muted-foreground/40'>/</span>
          <span className='text-sm font-semibold text-foreground'>
            Feature Docs
          </span>
          <div className='ml-auto'>
            <DocsSearch />
          </div>
        </div>
      </header>

      <div className='mx-auto flex max-w-screen-xl'>
        {/* Sidebar */}
        <aside className='sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border py-6 pr-4 md:block lg:w-72'>
          <DocsSidebar tree={tree} base={DOCS_BASE} />
        </aside>

        {/* Main content */}
        <main className='min-w-0 flex-1 px-6 py-8 md:px-10'>{children}</main>
      </div>
    </div>
  );
}
