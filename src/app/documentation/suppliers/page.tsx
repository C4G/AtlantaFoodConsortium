export default function SuppliersPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-900'>For Suppliers</h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            How to Register
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>
              Visit the MAFC website and click &quot;Sign In&quot; in the top
              right corner
            </li>
            <li>Sign in with Google using your business email</li>
            <li>
              Complete onboarding by selecting &quot;Supplier&quot; as your role
            </li>
            <li>
              Provide your business details including name, address, and contact
              information
            </li>
            <li>Specify your donation preferences and pickup locations</li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Posting a Product
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Once registered, you can start posting food products available for
            donation.
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              Include detailed product information (type, quantity, measurement
              unit)
            </li>
            <li>Specify pickup timeframe (same day, next day, etc.)</li>
            <li>Set pickup location and any special instructions</li>
            <li>Indicate if the product is for donation or purchase</li>
            <li>Add expiration dates and storage requirements</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Understanding Pickup Timeframes
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Pickup timeframes help nonprofits plan their operations and ensure
            food safety.
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              <strong className='text-gray-900'>Same Day:</strong> Product must
              be picked up on the day it&#39;s posted
            </li>
            <li>
              <strong className='text-gray-900'>Next Day:</strong> Available for
              pickup the following business day
            </li>
            <li>
              <strong className='text-gray-900'>Within 3 Days:</strong> Flexible
              pickup within 3 business days
            </li>
            <li>
              <strong className='text-gray-900'>Within 1 Week:</strong>{' '}
              Available for pickup within 7 days
            </li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Viewing Claim Status
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Track the status of your posted products and manage claims.
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              <strong className='text-gray-900'>Available:</strong> Product is
              posted and waiting for claims
            </li>
            <li>
              <strong className='text-gray-900'>Reserved:</strong> A nonprofit
              has claimed the product
            </li>
            <li>
              <strong className='text-gray-900'>Pending:</strong> Claim is
              pending your confirmation
            </li>
            <li>Receive notifications when products are claimed</li>
            <li>Confirm or reject claims based on availability</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Managing Donations
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>Review claim requests and verify nonprofit legitimacy</li>
            <li>Confirm pickup arrangements with the claiming organization</li>
            <li>Prepare products for pickup at the agreed time</li>
            <li>Mark products as picked up once collection is complete</li>
            <li>Provide feedback on the donation process</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
