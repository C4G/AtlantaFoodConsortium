'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import type { Root, Item, Folder } from 'fumadocs-core/page-tree';

interface SidebarProps {
  tree: Root;
  base: string;
}

function SidebarItem({
  item,
  activePath,
  indent = false,
}: {
  item: Item;
  activePath: string;
  indent?: boolean;
}) {
  const isActive = item.url === activePath;
  return (
    <Link
      href={item.url}
      className={[
        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
        indent ? 'pl-6' : '',
        isActive
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ChevronRight
        className={`h-3 w-3 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
      {item.name as string}
    </Link>
  );
}

function hasActiveChild(folder: Folder, activePath: string): boolean {
  return (folder.children as Array<Item | Folder>).some((child) => {
    if (child.type === 'page') return (child as Item).url === activePath;
    if (child.type === 'folder')
      return hasActiveChild(child as Folder, activePath);
    return false;
  });
}

function SidebarFolder({
  folder,
  activePath,
}: {
  folder: Folder;
  activePath: string;
}) {
  const [isOpen, setIsOpen] = useState(
    () =>
      (folder as Folder & { defaultOpen?: boolean }).defaultOpen !== false ||
      hasActiveChild(folder, activePath)
  );

  return (
    <div className='mb-1'>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='mb-1 flex w-full items-center gap-1 rounded-md px-3 py-1 transition-colors hover:bg-muted'
      >
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? '' : '-rotate-90'
          }`}
        />
        <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          {folder.name as string}
        </span>
      </button>
      {isOpen && (
        <div className='space-y-0.5'>
          {(
            folder.children as Array<Item | Folder | { type: 'separator' }>
          ).map((child, i) => {
            if (child.type === 'page') {
              return (
                <SidebarItem
                  key={i}
                  item={child as Item}
                  activePath={activePath}
                  indent
                />
              );
            }
            if (child.type === 'folder') {
              return (
                <SidebarFolder
                  key={i}
                  folder={child as Folder}
                  activePath={activePath}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

export default function DocsSidebar({ tree, base }: SidebarProps) {
  const activePath = usePathname();

  return (
    <nav className='flex flex-col gap-0.5'>
      {/* Logo / Title */}
      <div className='mb-4 flex items-center gap-2 px-3 py-2'>
        <div className='flex h-7 w-7 items-center justify-center rounded-md bg-primary'>
          <BookOpen className='h-4 w-4 text-primary-foreground' />
        </div>
        <Link
          href={base}
          className='text-sm font-semibold text-foreground hover:text-primary'
        >
          Feature Docs
        </Link>
      </div>

      <div className='space-y-0.5'>
        {(tree.children as Array<Item | Folder | { type: 'separator' }>).map(
          (node, i) => {
            if (node.type === 'page') {
              return (
                <SidebarItem
                  key={i}
                  item={node as Item}
                  activePath={activePath}
                />
              );
            }
            if (node.type === 'folder') {
              return (
                <SidebarFolder
                  key={i}
                  folder={node as Folder}
                  activePath={activePath}
                />
              );
            }
            if (node.type === 'separator') {
              return <div key={i} className='my-2 border-t border-border' />;
            }
            return null;
          }
        )}
      </div>

      {/* Footer link back to main docs */}
      <div className='mt-6 border-t border-border pt-4'>
        <Link
          href='/documentation'
          className='flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ExternalLink className='h-3.5 w-3.5 shrink-0' />
          Back to Documentation
        </Link>
      </div>
    </nav>
  );
}
