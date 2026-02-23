import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/layout/user-menu';

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === 'NONPROFIT') {
    redirect('/nonprofit');
  } else if (session?.user?.role === 'SUPPLIER') {
    redirect('/supplier');
  } else if (session?.user?.role === 'ADMIN') {
    redirect('/admin');
  } else if (session?.user && !session.user.role) {
    redirect('/onboarding');
  }

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
