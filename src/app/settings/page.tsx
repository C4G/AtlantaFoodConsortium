import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EmailSettingsForm } from './email-settings-form';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your notification preferences',
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <h1 className='mb-1 text-2xl font-bold'>Account Settings</h1>
      <p className='mb-8 text-sm text-muted-foreground'>
        Manage your notification preferences for the Metro Atlanta Food
        Consortium platform.
      </p>

      <section className='rounded-lg border bg-card p-6'>
        <h2 className='mb-1 text-base font-semibold'>Email Notifications</h2>
        <p className='mb-6 text-sm text-muted-foreground'>
          Control which emails the platform sends to you. Some emails are
          required and cannot be turned off.
        </p>

        <EmailSettingsForm />
      </section>
    </div>
  );
}
