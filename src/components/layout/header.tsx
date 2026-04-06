'use client';

import Link from 'next/link';
import { UserMenu } from './user-menu';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string };

function buildNavItems(
  role: false | UserRole | undefined | null,
  role: false | string | null | undefined,
  isAdminOrStaff: boolean,
  isOther: boolean
): NavItem[] {
  const items: NavItem[] = [];

  if (isAdminOrStaff) {
    items.push({ href: '/admin', label: 'Admin' });
    items.push({ href: '/users', label: 'Users' });
  }

  if (role === 'SUPPLIER') {
    items.push({ href: '/supplier', label: 'Supplier' });
  }

  if (role === 'NONPROFIT') {
    items.push({ href: '/nonprofit', label: 'Nonprofit' });
  }

  items.push(
    { href: '/announcements', label: 'Announcements' },
    { href: '/discussion', label: 'Discussion' },
    { href: '/documentation', label: 'Documentation' }
  );

  if (isOther) {
    items.push({ href: '/onboarding', label: 'Complete Profile' });
  }

  return items;
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const { data, status } = useSession();
  const pathname = usePathname();

  const role = status === 'authenticated' && data?.user.role;
  const isAdminOrStaff = role === 'ADMIN' || role === 'STAFF';
  const isOther = role === 'OTHER';

  const navItems = buildNavItems(role, isAdminOrStaff, isOther);

  const pageLabels: Record<string, string> = {
    '/admin': 'Admin',
    '/users': 'Users',
    '/suppliers': 'Suppliers',
    '/nonprofit': 'Nonprofit',
    '/announcements': 'Announcements',
    '/discussion': 'Discussion',
  };

  const activeKey = Object.keys(pageLabels).find((key) =>
    pathname.startsWith(key)
  );
  const triggerLabel = activeKey ? pageLabels[activeKey] : 'Menu';

  return (
    <header className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 border-b bg-background px-4 py-4 sm:px-6'>
      <div className='flex min-w-0 flex-1 items-center gap-3 sm:gap-4'>
        <Link href='/' className='flex shrink-0 items-center space-x-2'>
          <Image
            src='/c4g-logo.png'
            alt='Computing for good'
            width={32}
            height={32}
          />
        </Link>

        <nav
          aria-label='Main'
          className='hidden min-w-0 flex-1 items-center gap-x-2 gap-y-1 overflow-x-auto md:flex lg:gap-x-4'
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'shrink-0 text-sm font-medium whitespace-nowrap transition-colors hover:text-primary',
                isNavActive(pathname, item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='md:hidden'>
          <DropdownMenu>
            <DropdownMenuTrigger className='flex items-center gap-1 text-sm font-medium hover:text-primary'>
              {triggerLabel} <ChevronDown size={14} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className='w-48' align='start'>
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <UserMenu />
    </header>
  );
}
