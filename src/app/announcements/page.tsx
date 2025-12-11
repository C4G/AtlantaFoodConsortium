import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AnnouncementsGrid } from './announcements-grid';

export const metadata: Metadata = {
  title: 'Announcements',
  description: 'Admin Announcement Page',
};

export default async function AnnouncementsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className='px-4 py-8'>
      <h1 className='mb-4 text-2xl font-bold'>Announcement System</h1>
      <AnnouncementsGrid />
    </div>
  );
}
