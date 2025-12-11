'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserMenu } from '@/components/layout/user-menu';

export default function HomePage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.role) {
      router.push('/onboarding');
    } else if (session?.user?.role) {
      if (session?.user?.role === 'NONPROFIT') {
        router.push('/nonprofit');
      } else if (session?.user?.role === 'SUPPLIER') {
        router.push('/supplier');
      } else if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      }
    } else {
      router.push('/');
    }
  }, [status, router, session]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <div className='w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Welcome to Metro Atlanta Food Consortium
          </h1>
          <p className='mt-2 text-sm text-slate-600'>
            Please sign in to continue
          </p>
        </div>
        <div className='mt-8 flex justify-center'>
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
