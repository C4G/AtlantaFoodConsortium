import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DiscussionThreadsGrid } from './discussion-grid';

export const metadata: Metadata = {
  title: 'Discussion Threads',
  description: 'Discussion Threads Page',
};

export default async function DiscussionThreadsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  return (
    <div className='px-4 py-8'>
      <h1 className='mb-4 text-2xl font-bold'>Discussion Threads</h1>
      <DiscussionThreadsGrid />
    </div>
  );
}
