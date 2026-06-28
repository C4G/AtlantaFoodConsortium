'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const [, setRole] = useState<string>('');
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect to homepage if not logged in
    if (!session?.user) {
      router.replace('/');
      return;
    }
    // If user already has a role, redirect to the appropriate dashboard
    const role = session?.user?.role;
    if (role === 'NONPROFIT') router.push('/nonprofit');
    else if (role === 'SUPPLIER') router.push('/supplier');
    else if (role === 'ADMIN') router.push('/admin');
  }, [session, status, router]);

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);

    // Redirect to role-specific onboarding page
    if (selectedRole === 'nonprofit') {
      router.push('/onboarding/nonprofit');
    } else if (selectedRole === 'supplier') {
      router.push('/onboarding/supplier');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6 rounded-xl bg-card p-6 shadow-lg'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-foreground'>
            Complete Your Profile
          </h1>
        </div>

        <p className='text-sm text-muted-foreground'>
          To post or claim food donations, register as a supplier or nonprofit
          below. You can continue using discussions and announcements without
          completing this step.
        </p>

        <div className='space-y-4'>
          <button
            onClick={() => handleRoleSelection('nonprofit')}
            className='w-full rounded-lg border border-border p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          >
            <p className='font-semibold text-foreground'>🏢 Nonprofit</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Receive food donations for your community organization.
            </p>
          </button>

          <button
            onClick={() => handleRoleSelection('supplier')}
            className='w-full rounded-lg border border-border p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          >
            <p className='font-semibold text-foreground'>🚚 Supplier</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Post surplus food available for donation or pickup.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
