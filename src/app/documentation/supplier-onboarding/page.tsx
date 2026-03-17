export default function SupplierOnboardingPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-foreground'>
        Supplier Onboarding Guide
      </h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Step 1: Sign In with Google
          </h2>
          <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
            <li>Visit the MAFC website</li>
            <li>
              Click the &quot;Sign In&quot; button in the top right corner
            </li>
            <li>Choose &quot;Sign in with Google&quot;</li>
            <li>Select your business Google account</li>
            <li>
              Grant permission for MAFC to access your basic profile information
            </li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Step 2: Complete Onboarding
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            After signing in, you&#39;ll be taken through the onboarding
            process:
          </p>
          <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
            <li>Select &quot;Supplier&quot; as your role when prompted</li>
            <li>Read and accept the platform terms of service</li>
            <li>Confirm your understanding of donation guidelines</li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Step 3: Fill in Supplier Details
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            Complete your supplier profile with accurate business information:
          </p>
          <ul className='list-inside list-disc space-y-2 text-foreground/80'>
            <li>
              <strong className='text-foreground'>Business Name:</strong> Your
              official company or organization name
            </li>
            <li>
              <strong className='text-foreground'>Address:</strong> Complete
              business address for pickup coordination
            </li>
            <li>
              <strong className='text-foreground'>Contact Information:</strong>{' '}
              Phone number and preferred contact method
            </li>
            <li>
              <strong className='text-foreground'>Business Type:</strong>{' '}
              Restaurant, grocery store, food manufacturer, etc.
            </li>
            <li>
              <strong className='text-foreground'>Donation Preferences:</strong>{' '}
              Types of food you typically donate
            </li>
            <li>
              <strong className='text-foreground'>Pickup Locations:</strong>{' '}
              Where nonprofits can collect donations
            </li>
          </ul>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Step 4: Post Your First Product
          </h2>
          <p className='leading-relaxed text-foreground/80'>
            Now you&#39;re ready to make your first food donation available:
          </p>
          <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
            <li>Navigate to the &quot;Post Product&quot; section</li>
            <li>
              Select the product category (Protein, Produce, Shelf-Stable, etc.)
            </li>
            <li>
              Enter product details:
              <ul className='ml-6 mt-2 list-inside list-disc space-y-1 text-foreground/80'>
                <li>Product name and description</li>
                <li>
                  Quantity and measurement unit (pounds, cases, servings, etc.)
                </li>
                <li>Expiration date (if applicable)</li>
                <li>
                  Storage requirements (refrigerated, frozen, dry storage)
                </li>
              </ul>
            </li>
            <li>
              Set pickup timeframe (same day, next day, within 3 days, etc.)
            </li>
            <li>Specify pickup location and any special instructions</li>
            <li>Choose donation type (donation or available for purchase)</li>
            <li>Review all information and click &quot;Post Product&quot;</li>
          </ol>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Step 5: What Happens After Posting
          </h2>

          <div className='space-y-6'>
            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-foreground'>
                Initial Status
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                Your product will appear as &quot;Available&quot; in the system.
                Nonprofits can now browse and claim your donation.
              </p>
            </div>

            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-foreground'>
                When a Nonprofit Claims
              </h3>
              <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
                <li>You&#39;ll receive a notification about the claim</li>
                <li>Review the nonprofit&#39;s information and legitimacy</li>
                <li>Confirm or reject the claim based on your availability</li>
                <li>
                  If confirmed, the status changes to &quot;Reserved&quot;
                </li>
              </ol>
            </div>

            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-foreground'>
                Pickup Coordination
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  The nonprofit will contact you to arrange pickup details
                </li>
                <li>
                  Agree on a specific date and time within your posted timeframe
                </li>
                <li>Prepare the product for pickup as described</li>
                <li>Ensure someone is available at the pickup location</li>
              </ul>
            </div>

            <div className='space-y-3'>
              <h3 className='text-lg font-medium text-foreground'>
                Completion
              </h3>
              <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
                <li>
                  Once pickup is complete, mark the product as &quot;Picked
                  Up&quot;
                </li>
                <li>
                  This helps track successful donations and platform impact
                </li>
                <li>
                  You can view donation history in your supplier dashboard
                </li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
