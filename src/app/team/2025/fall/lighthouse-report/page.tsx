import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lighthouse Report',
  description: 'Lighthouse performance report for our project',
};

export default function LighthouseReportPage() {
  const lighthouseScores = {
    performanceScore: 100,
    accessibilityScore: 92,
    bestPracticesScore: 100,
    seoScore: 100,
  };

  return (
    <div className='py-12 sm:py-16'>
      <h1 className='mb-4 text-2xl font-semibold'>Lighthouse Report</h1>
      <div>
        <div className='mt-4 grid grid-cols-2 gap-4 rounded-lg p-4 sm:grid-cols-4'>
          {lighthouseScores.performanceScore !== null && (
            <div className='rounded-lg bg-muted p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Performance
              </p>
              <p className='text-2xl font-semibold text-foreground'>
                {lighthouseScores.performanceScore}
              </p>
            </div>
          )}
          {lighthouseScores.accessibilityScore !== null && (
            <div className='rounded-lg bg-muted p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Accessibility
              </p>
              <p className='text-2xl font-semibold text-foreground'>
                {lighthouseScores.accessibilityScore}
              </p>
            </div>
          )}
          {lighthouseScores.bestPracticesScore !== null && (
            <div className='rounded-lg bg-muted p-4'>
              <p className='text-sm font-medium text-muted-foreground'>
                Best Practices
              </p>
              <p className='text-2xl font-semibold text-foreground'>
                {lighthouseScores.bestPracticesScore}
              </p>
            </div>
          )}
          {lighthouseScores.seoScore !== null && (
            <div className='rounded-lg bg-muted p-4'>
              <p className='text-sm font-medium text-muted-foreground'>SEO</p>
              <p className='text-2xl font-semibold text-foreground'>
                {lighthouseScores.seoScore}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
