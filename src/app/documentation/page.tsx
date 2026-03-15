import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function DocsPage() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    // Handle auth errors gracefully - session will remain null
    console.error('Auth error in documentation page:', error);
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Documentation</h1>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border p-6'>
          <h2 className='mb-2 text-xl font-semibold'>Platform Overview</h2>
          <p className='mb-4 text-gray-600'>
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
          <p className='mb-4 text-gray-600'>
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
          <p className='mb-4 text-gray-600'>
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
          <p className='mb-4 text-gray-600'>
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
          <p className='mb-4 text-gray-600'>
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
          <p className='mb-4 text-gray-600'>
            Step-by-step guide for new nonprofits to join the platform.
          </p>
          <Link
            href='/documentation/nonprofit-onboarding'
            className='text-blue-600 hover:underline'
          >
            Read more →
          </Link>
        </div>

        {(session?.user?.role === 'ADMIN' ||
          session?.user?.role === 'STAFF') && (
          <div className='rounded-lg border p-6 md:col-span-2'>
            <h2 className='mb-2 text-xl font-semibold'>Admin Guide</h2>
            <p className='mb-4 text-gray-600'>
              Administrative functions for managing users, approvals, and
              platform operations.
            </p>
            <Link
              href='/documentation/admin'
              className='text-blue-600 hover:underline'
            >
              Read more →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
