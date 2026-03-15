export default function NonprofitsPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-900'>For Nonprofits</h1>

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
            <li>
              Choose to sign in with Google using your organization&#39;s email
            </li>
            <li>
              Complete the onboarding process by selecting &quot;Nonprofit&quot;
              as your role
            </li>
            <li>
              Fill in your organization&#39;s details including name, address,
              and contact information
            </li>
            <li>
              Upload your nonprofit approval document (IRS 501(c)(3) letter or
              equivalent)
            </li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Uploading Your Approval Document
          </h2>
          <p className='leading-relaxed text-gray-700'>
            To ensure the integrity of our platform, all nonprofit organizations
            must provide proof of their tax-exempt status. This helps maintain
            trust and ensures that donated food reaches legitimate charitable
            organizations.
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              Acceptable documents include IRS 501(c)(3) determination letters
            </li>
            <li>Documents must be in PDF format and clearly legible</li>
            <li>Upload is done during the registration process</li>
            <li>Admin approval is required before you can access products</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Browsing Available Products
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Once your account is approved, you can browse available food
            products from our supplier partners.
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              Products are categorized by type (protein, produce, shelf-stable,
              etc.)
            </li>
            <li>
              View product details including quantity, pickup location, and
              timeframe
            </li>
            <li>
              Use filters to find products that match your organization&#39;s
              needs
            </li>
            <li>Check product status to see availability</li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Claiming Food
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>Find a product you need and click &quot;Claim&quot;</li>
            <li>Review the pickup details and confirm the claim</li>
            <li>
              You&#39;ll receive a notification when the supplier confirms
            </li>
            <li>Coordinate pickup at the agreed time and location</li>
            <li>Mark the pickup as complete once received</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
