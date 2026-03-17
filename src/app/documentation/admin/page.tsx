'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDocsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (
      !session ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')
    ) {
      router.replace('/');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className='px-4 py-8'>Loading...</div>;
  }

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')
  ) {
    return null;
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <h1 className='mb-8 text-4xl font-bold text-foreground'>Admin Guide</h1>

      <div className='space-y-8'>
        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Approving/Rejecting Nonprofit Documents
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Document Review Process
              </h3>
              <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
                <li>Access the Admin Dashboard from the main navigation</li>
                <li>Navigate to the &quot;Nonprofits&quot; tab</li>
                <li>Review pending nonprofit applications</li>
                <li>Click on a nonprofit to view their submitted documents</li>
                <li>
                  Download and review the nonprofit certification document
                </li>
              </ol>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Approval Criteria
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>Valid IRS 501(c)(3) determination letter or equivalent</li>
                <li>Document is current and not expired</li>
                <li>Organization name matches the registration</li>
                <li>Document is legible and complete</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Approval Actions
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  <strong className='text-foreground'>Approve:</strong> Click
                  &quot;Approve&quot; to grant access to the platform
                </li>
                <li>
                  <strong className='text-foreground'>Reject:</strong> Click
                  &quot;Reject&quot; with a reason for denial
                </li>
                <li>
                  <strong className='text-foreground'>
                    Request More Info:
                  </strong>{' '}
                  Ask for additional documentation if needed
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Managing Users
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Viewing User Information
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                Access user management through the Admin Dashboard. You can view
                all registered users, their roles, and account status.
              </p>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                User Roles
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  <strong className='text-foreground'>ADMIN:</strong> Full
                  platform access and administrative privileges
                </li>
                <li>
                  <strong className='text-foreground'>STAFF:</strong> Limited
                  administrative access for support roles
                </li>
                <li>
                  <strong className='text-foreground'>SUPPLIER:</strong>{' '}
                  Businesses donating food products
                </li>
                <li>
                  <strong className='text-foreground'>NONPROFIT:</strong>{' '}
                  Organizations receiving donations
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                User Management Actions
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  <strong className='text-foreground'>Rename:</strong> Update
                  user display names and organization names
                </li>
                <li>
                  <strong className='text-foreground'>Change Roles:</strong>{' '}
                  Modify user roles (use caution with admin privileges)
                </li>
                <li>
                  <strong className='text-foreground'>Delete:</strong> Remove
                  inactive or problematic accounts
                </li>
                <li>
                  <strong className='text-foreground'>View Activity:</strong>{' '}
                  Check user login history and platform usage
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Announcements
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Creating Announcements
              </h3>
              <ol className='list-inside list-decimal space-y-2 text-foreground/80'>
                <li>
                  Navigate to the Announcements section in the admin panel
                </li>
                <li>Click &quot;Create New Announcement&quot;</li>
                <li>Enter a title and detailed message</li>
                <li>
                  Select target audience (All Users, Suppliers, Nonprofits, or
                  Admins)
                </li>
                <li>Set publication date and optional expiration date</li>
                <li>Publish the announcement</li>
              </ol>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Managing Announcements
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>Edit existing announcements to update content</li>
                <li>Archive old announcements to keep the list clean</li>
                <li>Monitor announcement engagement and feedback</li>
                <li>
                  Use announcements for platform updates, policy changes, or
                  important notices
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='border-b border-border pb-2 text-2xl font-bold text-foreground'>
            Dashboard Metrics
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Overview Metrics
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  <strong className='text-foreground'>Total Users:</strong>{' '}
                  Count of all registered platform users
                </li>
                <li>
                  <strong className='text-foreground'>Active Suppliers:</strong>{' '}
                  Suppliers with products currently available
                </li>
                <li>
                  <strong className='text-foreground'>
                    Active Nonprofits:
                  </strong>{' '}
                  Approved nonprofits actively using the platform
                </li>
                <li>
                  <strong className='text-foreground'>
                    Products Available:
                  </strong>{' '}
                  Current food products posted for donation
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Activity Metrics
              </h3>
              <ul className='list-inside list-disc space-y-2 text-foreground/80'>
                <li>
                  <strong className='text-foreground'>Products Donated:</strong>{' '}
                  Total items successfully donated
                </li>
                <li>
                  <strong className='text-foreground'>Claims Processed:</strong>{' '}
                  Number of successful product claims
                </li>
                <li>
                  <strong className='text-foreground'>
                    Pickup Completion Rate:
                  </strong>{' '}
                  Percentage of claims resulting in completed pickups
                </li>
                <li>
                  <strong className='text-foreground'>Platform Growth:</strong>{' '}
                  User registration trends over time
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-foreground'>
                Using Dashboard Data
              </h3>
              <p className='leading-relaxed text-foreground/80'>
                Use these metrics to identify peak usage times for maintenance,
                track platform growth and engagement, monitor donation impact,
                and identify areas needing additional support or features.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
