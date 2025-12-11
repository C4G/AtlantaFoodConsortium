'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const [role, setRole] = useState<string>('');
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
    if (session?.user?.role) {
      if (session.user.role === 'NONPROFIT') {
        router.push('/nonprofit');
      } else if (session.user.role === 'SUPPLIER') {
        router.push('/supplier');
      } else if (session.user.role === 'ADMIN') {
        router.push('/admin');
      }
    }
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
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <div className='w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-lg'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Complete Your Profile
          </h1>
        </div>

        <div className='space-y-6'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Select Role
            </label>
            <select
              className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400'
              onChange={(e) => handleRoleSelection(e.target.value)}
              value={role}
            >
              <option value=''>Select your role</option>
              <option value='nonprofit'>Nonprofit</option>
              <option value='supplier'>Supplier</option>
            </select>
          </div>

          <div className='text-center text-sm text-slate-600'>
            <p>
              Please select your role to continue with the appropriate
              registration process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
