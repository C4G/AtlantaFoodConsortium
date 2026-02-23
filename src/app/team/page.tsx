import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Team',
  description: 'View our team across different semesters',
};

const semesters = [
  {
    year: '2026',
    season: 'Spring',
    path: '/team/2026/spring',
    description: 'Current semester',
    isCurrent: true,
  },
  {
    year: '2025',
    season: 'Fall',
    path: '/team/2025/fall',
    description: 'Previous semester',
    isCurrent: false,
  },
];

const TeamPage = () => {
  return (
    <div className='container mx-auto px-4 py-12'>
      <div className='mb-12 text-center'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
          C4G Teams
        </h1>
        <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
          Explore our team members and projects across different semesters
        </p>
      </div>

      <div className='mx-auto grid max-w-5xl gap-6 sm:grid-cols-2'>
        {semesters.map((semester) => (
          <Link
            key={semester.path}
            href={semester.path}
            className='group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-900'
          >
            {semester.isCurrent && (
              <div className='absolute right-4 top-4'>
                <span className='rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white dark:bg-indigo-500'>
                  Current
                </span>
              </div>
            )}
            <div className='mb-4'>
              <h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                {semester.season} {semester.year}
              </h2>
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                {semester.description}
              </p>
            </div>
            <div className='flex items-center text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-300'>
              <span className='mr-2 text-sm font-medium'>View team</span>
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeamPage;
