import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Documentation</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>Platform Overview</h2>
          <p className='mb-4 text-muted-foreground'>
            Learn about the Metro Atlanta Food Consortium (MAFC) mission and how
            the platform works.
          </p>
          <Link
            href='/documentation/overview'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>For Nonprofits</h2>
          <p className='mb-4 text-muted-foreground'>
            How to register, upload documents, and claim available food
            products.
          </p>
          <Link
            href='/documentation/nonprofits'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>For Suppliers</h2>
          <p className='mb-4 text-muted-foreground'>
            How to register, post products, and manage pickup timeframes.
          </p>
          <Link
            href='/documentation/suppliers'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>FAQ & Troubleshooting</h2>
          <p className='mb-4 text-muted-foreground'>
            Common questions about the platform and how it works.
          </p>
          <Link
            href='/documentation/faq'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>Supplier Onboarding</h2>
          <p className='mb-4 text-muted-foreground'>
            Step-by-step guide for new suppliers to get started.
          </p>
          <Link
            href='/documentation/supplier-onboarding'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>Nonprofit Onboarding</h2>
          <p className='mb-4 text-muted-foreground'>
            Step-by-step guide for new nonprofits to join the platform.
          </p>
          <Link
            href='/documentation/nonprofit-onboarding'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6 md:col-span-2'>
          <h2 className='mb-2 text-xl font-semibold'>Admin Guide</h2>
          <p className='mb-4 text-muted-foreground'>
            Administrative functions for managing users, approvals, and platform
            operations.
          </p>
          <Link
            href='/documentation/admin'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        <div className='rounded-lg border p-6 md:col-span-2'>
          <h2 className='mb-2 text-xl font-semibold'>Feature Docs</h2>
          <p className='mb-4 text-muted-foreground'>
            Developer docs for all platform features. Add a{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground'>
              .md
            </code>{' '}
            file to{' '}
            <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground'>
              content/docs/
            </code>{' '}
            and a new page appears automatically.
          </p>
          <Link
            href='/documentation/features'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  );
}
