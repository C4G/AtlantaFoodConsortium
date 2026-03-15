export default function NonprofitOnboardingPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-gray-900'>
        Nonprofit Onboarding Guide
      </h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 1: Sign In with Google
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>Visit the MAFC website</li>
            <li>
              Click the &quot;Sign In&quot; button in the top right corner
            </li>
            <li>Choose &quot;Sign in with Google&quot;</li>
            <li>Select your organization&#39;s Google account</li>
            <li>
              Grant permission for MAFC to access your basic profile information
            </li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 2: Complete Onboarding
          </h2>
          <p className='leading-relaxed text-gray-700'>
            After signing in, you&#39;ll be guided through the registration
            process:
          </p>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>
              Select &quot;Nonprofit&quot; as your organization type when
              prompted
            </li>
            <li>Read and accept the platform terms of service</li>
            <li>
              Confirm your understanding of the nonprofit verification process
            </li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 3: Fill in Organization Details
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Provide complete and accurate information about your nonprofit:
          </p>
          <ul className='list-inside list-disc space-y-2 text-gray-700'>
            <li>
              <strong className='text-gray-900'>Organization Name:</strong> Your
              official nonprofit name
            </li>
            <li>
              <strong className='text-gray-900'>Address:</strong> Main address
              and service locations
            </li>
            <li>
              <strong className='text-gray-900'>Contact Information:</strong>{' '}
              Phone, email, and primary contact person
            </li>
            <li>
              <strong className='text-gray-900'>Organization Type:</strong> Food
              bank, shelter, community center, etc.
            </li>
            <li>
              <strong className='text-gray-900'>Service Area:</strong>{' '}
              Communities and neighborhoods you serve
            </li>
            <li>
              <strong className='text-gray-900'>Capacity:</strong> Approximate
              number of people served daily/weekly
            </li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 4: Upload Approval Document
          </h2>
          <p className='leading-relaxed text-gray-700'>
            The most important step is providing proof of your nonprofit status:
          </p>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>
              Locate your IRS 501(c)(3) determination letter or equivalent
              certification
            </li>
            <li>Ensure the document is current and clearly legible</li>
            <li>Convert to PDF format if necessary</li>
            <li>Upload the document through the registration form</li>
            <li>Review the uploaded document to ensure it&#39;s complete</li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 5: Wait for Admin Approval
          </h2>
          <div className='space-y-3'>
            <h3 className='text-lg font-medium text-gray-900'>
              What Happens Next
            </h3>
            <ul className='list-inside list-disc space-y-2 text-gray-700'>
              <li>Administrators review your submitted documents</li>
              <li>They verify your nonprofit status and legitimacy</li>
              <li>You&#39;ll receive an email notification of the decision</li>
              <li>If approved, your account becomes active immediately</li>
              <li>
                If rejected, you&#39;ll receive feedback on what additional
                information is needed
              </li>
            </ul>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 6: Browse and Claim Available Products
          </h2>
          <p className='leading-relaxed text-gray-700'>
            Once approved, you can start accessing food donations:
          </p>
          <ol className='list-inside list-decimal space-y-2 text-gray-700'>
            <li>Log in to your approved account</li>
            <li>Navigate to the &quot;Browse Products&quot; section</li>
            <li>
              Use filters to find products suitable for your organization:
              <ul className='ml-6 mt-2 list-inside list-disc space-y-1 text-gray-700'>
                <li>Product type (protein, produce, shelf-stable)</li>
                <li>Location (near your service areas)</li>
                <li>Pickup timeframe (matches your schedule)</li>
                <li>Quantity (appropriate for your needs)</li>
              </ul>
            </li>
            <li>Review product details and supplier information</li>
            <li>Click &quot;Claim&quot; on products you want to request</li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-gray-200 pb-2 text-2xl font-bold text-gray-800'>
            Step 7: Complete the Claim Process
          </h2>

          <div className='space-y-6'>
            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-gray-900'>
                After Claiming
              </h3>
              <ol className='list-inside list-decimal space-y-2 text-gray-700'>
                <li>The supplier will review and confirm your claim</li>
                <li>You&#39;ll receive a notification once confirmed</li>
                <li>Contact the supplier to arrange pickup details</li>
                <li>Coordinate a pickup time within the posted timeframe</li>
                <li>Pick up the food at the agreed location and time</li>
                <li>Mark the pickup as complete in the platform</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
