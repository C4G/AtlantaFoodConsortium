'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft } from 'lucide-react';

const basePath = '/team/2025/fall';

const tabs = [
  { name: 'Team', href: basePath },
  { name: 'Project Description', href: `${basePath}/project-description` },
  { name: 'Project Goal', href: `${basePath}/project-goal` },
  { name: 'Lighthouse Report', href: `${basePath}/lighthouse-report` },
  { name: 'Presentation Slides', href: `${basePath}/presentation-slides` },
  { name: 'Weekly Updates', href: `${basePath}/weekly-updates` },
  { name: 'Project Peer Evaluations', href: `${basePath}/peer-evaluations` },
  { name: 'Demo', href: `${basePath}/demo` },
];

export function TeamTabs() {
  const pathname = usePathname();

  return (
    <div>
      <Link
        href='/team'
        className='mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
      >
        <ChevronLeft className='mr-1 h-4 w-4' />
        Back to all teams
      </Link>
      <Tabs value={pathname} className='flex w-full justify-center'>
        <TabsList className='inline-flex h-10 max-w-full items-center justify-center overflow-x-auto rounded-md bg-muted p-1 text-muted-foreground'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.href}
              value={tab.href}
              className='inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
              asChild
            >
              <Link href={tab.href}>{tab.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
