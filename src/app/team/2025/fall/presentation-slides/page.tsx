'use client';

export default function PresentationSlidesPage() {
  const miniPresentationLink = `https://gtvault-my.sharepoint.com/:v:/g/personal/tbahbouche3_gatech_edu/EcwZ5mBYqWhJkmc2E2BAx0sB1HwKkPyaMGI4M24i76NlgQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=SPumwL`;
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold'>Presentation Slides</h1>
      <section className='mt-8'>
        <h2 className='mb-4 text-xl font-semibold'>P4-MiniPresentation</h2>
        <button
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700'
          onClick={() => window.open(miniPresentationLink, '_blank')}
        >
          Open P4-MiniPresentation
        </button>
      </section>
    </div>
  );
}
