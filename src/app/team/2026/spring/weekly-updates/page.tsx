import { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Weekly Updates',
  description: 'Weekly project updates',
};

export default function WeeklyUpdatesPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>
        <Link
          href='https://gtvault-my.sharepoint.com/:w:/g/personal/tbahbouche3_gatech_edu/Ebx1yvrHnOJCvkd2XKejmykBwa2JGPk1BkKJWrI4OAgn8A'
          className='text-blue-600 underline'
        >
          Weekly Updates
        </Link>
      </h1>
    </div>
  );
}
