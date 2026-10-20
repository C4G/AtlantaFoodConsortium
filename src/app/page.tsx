import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/layout/user-menu';
import Link from 'next/link';
import { UserRole } from '../../types/types';

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === UserRole.NONPROFIT) {
    redirect('/nonprofit');
  } else if (session?.user?.role === UserRole.SUPPLIER) {
    redirect('/supplier');
  } else if (session?.user?.role === UserRole.ADMIN) {
    redirect('/admin');
  } else if (session?.user && !session.user.role) {
    redirect('/onboarding');
  }

  if (session?.user?.role === UserRole.OTHER) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
        <div className='w-full max-w-lg space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-foreground'>
              Welcome, {session.user.name ?? session.user.email}
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              You have access to community discussions and announcements.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Link
              href='/discussion'
              className='flex flex-col items-center rounded-lg border border-border p-4 text-center transition hover:border-primary/50 hover:shadow-sm'
            >
              <span className='text-2xl'>💬</span>
              <span className='mt-2 font-medium text-foreground'>
                Discussions
              </span>
              <span className='mt-1 text-xs text-muted-foreground'>
                Participate in community threads
              </span>
            </Link>

            <Link
              href='/announcements'
              className='flex flex-col items-center rounded-lg border border-border p-4 text-center transition hover:border-primary/50 hover:shadow-sm'
            >
              <span className='text-2xl'>📢</span>
              <span className='mt-2 font-medium text-foreground'>
                Announcements
              </span>
              <span className='mt-1 text-xs text-muted-foreground'>
                Stay up to date with platform news
              </span>
            </Link>
          </div>

          <div className='border-t border-border pt-4 text-center'>
            <p className='text-sm text-muted-foreground'>
              Want to donate or receive food?{' '}
              <Link
                href='/onboarding'
                className='font-medium text-foreground underline underline-offset-2 hover:text-muted-foreground'
              >
                Complete your profile
              </Link>{' '}
              to register as a supplier or nonprofit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-lg'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-foreground'>
            Welcome to Metro Atlanta Food Consortium
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Please sign in to continue
          </p>
        </div>
        <div className='mt-8 flex justify-center'>
          <UserMenu />
        </div>
        {process.env.ENABLE_TEST_LOGIN === 'true' && (
          <div className='border-t border-border pt-4'>
            <p className='mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Dev: quick login
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {[
                {
                  role: 'admin',
                  label: 'Admin',
                  color:
                    'bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 dark:border-red-800',
                },
                {
                  role: 'supplier',
                  label: 'Supplier',
                  color:
                    'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:border-blue-800',
                },
                {
                  role: 'nonprofit',
                  label: 'Nonprofit',
                  color:
                    'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 dark:border-green-800',
                },
                {
                  role: 'other',
                  label: 'Other',
                  color:
                    'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:border-slate-700',
                },
              ].map(({ role, label, color }) => (
                <a
                  key={role}
                  href={`/api/auth/test-login?role=${role}`}
                  className={`rounded-md border px-3 py-2 text-center text-sm font-medium transition ${color}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
