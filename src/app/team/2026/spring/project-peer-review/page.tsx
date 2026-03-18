import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Peer Review',
  description: 'Project peer review tasks for Spring 2026',
};

export default function ProjectPeerReviewPage() {
  return (
    <div className='py-12 sm:py-16'>
      <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
        Project Peer Review — Spring 2026
      </h2>

      <p className='mt-4 text-lg text-gray-600 dark:text-gray-400'>
        Please complete each task below. Quick login links for Admin, Supplier,
        Nonprofit, and Other accounts are available directly on the staging
        site&apos;s login page so no credentials are needed.
      </p>

      <h3 className='mt-10 text-2xl font-semibold'>
        Task 1: Discussions/Announcements with Other Type
      </h3>
      <p className='mt-4 text-lg'>
        Go to{' '}
        <a
          href='https://atlanta-food-consortium-staging.c4g.dev'
          className='text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://atlanta-food-consortium-staging.c4g.dev
        </a>
        . Click on the quick login link named <b>OTHER</b>. Once clicked
        navigate to the Discussions page and post a new discussion topic. Then,
        find an existing discussion thread and contribute a reply to it.
        Finally, browse the Announcements page and review any posted
        announcements.
      </p>

      <h3 className='mt-10 text-2xl font-semibold'>
        Task 2: Search for a Feature Within Docs
      </h3>
      <p className='mt-4 text-lg'>
        Go to{' '}
        <a
          href='https://atlanta-food-consortium-staging.c4g.dev/documentation/features'
          className='text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://atlanta-food-consortium-staging.c4g.dev/documentation/features
        </a>
        . Search a topic and fill out the provided form with the relevant
        information.
      </p>

      <h3 className='mt-10 text-2xl font-semibold'>Task 3: Dashboard Task</h3>

      <h4 className='mt-6 text-xl font-semibold'>Task 3a: Admin</h4>
      <p className='mt-2 text-lg'>
        Go to{' '}
        <a
          href='https://atlanta-food-consortium-staging.c4g.dev'
          className='text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'
          target='_blank'
          rel='noopener noreferrer'
        >
          https://atlanta-food-consortium-staging.c4g.dev
        </a>{' '}
        and log in using the <b>Admin</b> quick login. Using the dropdown in the
        top-left corner, navigate to <b>Users</b> and change one of the
        user&apos;s roles directly from the grid table.
      </p>

      <h4 className='mt-6 text-xl font-semibold'>Task 3b: Supplier</h4>
      <p className='mt-2 text-lg'>
        Log in using the <b>Supplier</b> quick login. Before doing anything, go
        to the <b>Overview</b> tab and take note of your current metrics (total
        products, available count, etc.). Then navigate to the <b>Products</b>{' '}
        tab and post a new product request by filling out the form with a name,
        quantity, unit, and product type. Once submitted, switch back to the{' '}
        <b>Overview</b> tab and confirm the charts and metrics have updated to
        reflect the new listing.
      </p>

      <h4 className='mt-6 text-xl font-semibold'>Task 3c: Nonprofit</h4>
      <p className='mt-2 text-lg'>
        Log in using the <b>Nonprofit</b> quick login. Before doing anything, go
        to the <b>Overview</b> tab and take note of your current metrics (total
        claims, pending, etc.). Then navigate to the <b>Available Products</b>{' '}
        tab and claim one of the listed products. Once claimed, switch back to
        the <b>Overview</b> tab and confirm the charts and metrics have updated
        to reflect your new claim.
      </p>
    </div>
  );
}
