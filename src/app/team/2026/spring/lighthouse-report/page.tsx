import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lighthouse Report',
  description: 'Lighthouse performance report for our project',
};

export default function LighthouseReportPage() {
  const lighthouseScores = {
    performanceScore: 71,
    accessibilityScore: 100,
    bestPracticesScore: 100,
    seoScore: 100,
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <div className='py-12 sm:py-16'>
      <h1 className='mb-2 text-3xl font-semibold tracking-tight sm:text-4xl'>
        Lighthouse Report
      </h1>
      <p className='mb-8 text-gray-500'>
        Scores for <span className='font-medium'>localhost:3000</span> &mdash;
        February 22, 2026
      </p>
      <div>
        <div className='mt-4 grid grid-cols-2 gap-4 rounded-lg p-4 sm:grid-cols-4'>
          {lighthouseScores.performanceScore !== null && (
            <div className='rounded-lg bg-gray-50 p-4'>
              <p className='text-sm font-medium text-gray-500'>Performance</p>
              <p
                className={`text-3xl font-bold ${getScoreColor(lighthouseScores.performanceScore)}`}
              >
                {lighthouseScores.performanceScore}
              </p>
            </div>
          )}
          {lighthouseScores.accessibilityScore !== null && (
            <div className='rounded-lg bg-gray-50 p-4'>
              <p className='text-sm font-medium text-gray-500'>Accessibility</p>
              <p
                className={`text-3xl font-bold ${getScoreColor(lighthouseScores.accessibilityScore)}`}
              >
                {lighthouseScores.accessibilityScore}
              </p>
            </div>
          )}
          {lighthouseScores.bestPracticesScore !== null && (
            <div className='rounded-lg bg-gray-50 p-4'>
              <p className='text-sm font-medium text-gray-500'>
                Best Practices
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(lighthouseScores.bestPracticesScore)}`}
              >
                {lighthouseScores.bestPracticesScore}
              </p>
            </div>
          )}
          {lighthouseScores.seoScore !== null && (
            <div className='rounded-lg bg-gray-50 p-4'>
              <p className='text-sm font-medium text-gray-500'>SEO</p>
              <p
                className={`text-3xl font-bold ${getScoreColor(lighthouseScores.seoScore)}`}
              >
                {lighthouseScores.seoScore}
              </p>
            </div>
          )}
        </div>
        <div className='mt-4 flex gap-4 text-sm text-gray-500'>
          <span className='flex items-center gap-1'>
            <span className='font-bold text-green-600'>90–100</span> Good
          </span>
          <span className='flex items-center gap-1'>
            <span className='font-bold text-orange-500'>50–89</span> Needs
            Improvement
          </span>
          <span className='flex items-center gap-1'>
            <span className='font-bold text-red-600'>0–49</span> Poor
          </span>
        </div>
        <div className='mt-6'>
          <Link
            href='/team/2026/spring/lighthouse-report/report.html'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700'
          >
            View Full Lighthouse Report
          </Link>
        </div>
      </div>
    </div>
  );
}
