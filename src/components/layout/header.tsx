'use client';

import Link from 'next/link';
import { UserMenu } from './user-menu';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { UserRole } from '../../../types/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { data, status } = useSession();
  const pathname = usePathname();

  const role = status === 'authenticated' && data?.user.role; // 'ADMIN', 'SUPPLIER', 'NONPROFIT', 'OTHER'
  const isAdminOrStaff = role === UserRole.ADMIN || role === UserRole.STAFF;
  const isOther = role === UserRole.OTHER;

  // Map routes to labels
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
    <header className='fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b bg-background px-6 py-4'>
      <div className='flex items-center justify-center gap-4'>
        <Link href='/' className='flex items-center space-x-2'>
          <Image
            src='/c4g-logo.png'
            alt='Computing for good'
            width={32}
            height={32}
          />
        </Link>

        {/* Dropdown Menu visible based on roles */}
        <DropdownMenu>
          <DropdownMenuTrigger className='flex items-center gap-1 text-sm font-medium hover:text-primary'>
            {triggerLabel} <ChevronDown size={14} />
          </DropdownMenuTrigger>

          <DropdownMenuContent className='w-48'>
            {/* Role Based - Admin or Staff */}
            {isAdminOrStaff && (
              <>
                <DropdownMenuItem asChild>
                  <Link href='/admin'>Admin</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href='/users'>Users</Link>
                </DropdownMenuItem>
              </>
            )}

            {/* Supplier Dashboard */}
            {role === UserRole.SUPPLIER && (
              <DropdownMenuItem asChild>
                <Link href='/supplier'>Supplier</Link>
              </DropdownMenuItem>
            )}

            {/* Nonprofit Dashboard */}
            {role === UserRole.NONPROFIT && (
              <DropdownMenuItem asChild>
                <Link href='/nonprofit'>Nonprofit</Link>
              </DropdownMenuItem>
            )}

            {/* Routes available for all */}
            <DropdownMenuItem asChild>
              <Link href='/announcements'>Announcements</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href='/discussion'>Discussion</Link>
            </DropdownMenuItem>

            {/* Prompt OTHER users to complete their profile */}
            {isOther && (
              <DropdownMenuItem asChild>
                <Link href='/onboarding'>Complete Profile</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <UserMenu />
    </header>
  );
}
