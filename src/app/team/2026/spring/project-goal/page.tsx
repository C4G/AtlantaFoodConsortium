import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Goal',
  description: 'Goals of our project',
};

export default function ProjectGoalPage() {
  return (
    <div className='py-12 sm:py-16'>
      <h1 className='mb-6 text-3xl font-semibold tracking-tight sm:text-4xl'>
        Spring 2026 Project Goals
      </h1>

      <div className='mb-12'>
        <h2 className='mb-4 text-2xl font-semibold'>Primary Goals</h2>
        <ul className='mt-4 list-disc space-y-3 pl-6 text-lg'>
          <li>
            Running through the application end-to-end and ensuring the workflow
            works as intended (including e.g. email notifications)
          </li>
          <li>
            Adding an administrative dashboard that shows statistics on the
            amount/etc. of food distributed through the platform
          </li>
          <li>
            Ensuring that enough user documentation exists in a publicly-facing
            site that we can point users to
          </li>
          <li>
            Adding/testing user management for administrators (being able to
            rename user accounts, delete, etc.)
          </li>
          <li>
            Configuring a new way to upload PDFs into the file system instead of
            being stored within the Prisma database
          </li>
        </ul>
      </div>

      <div className='mb-12'>
        <h2 className='mb-4 text-2xl font-semibold'>Deliverables</h2>
        <ul className='mt-4 list-disc space-y-3 pl-6 text-lg'>
          <li>
            <strong>End-to-End Workflow Documentation:</strong> Test cases
            demonstrating supplier posting → nonprofit notification → claim →
            status update
          </li>
          <li>
            <strong>Administrative Dashboard:</strong> Display total food
            distributed (pounds/cases), number of suppliers, number of
            participating nonprofits, and activity over time (basic metrics)
          </li>
          <li>
            <strong>User Documentation:</strong> Public-facing user guide as a
            PDF file or webpage, admin guide for approving nonprofits and
            managing users, and onboarding instructions for new suppliers and
            nonprofits
          </li>
          <li>
            <strong>Enhanced Admin User Management:</strong> Allow admins to
            rename user accounts, delete users, and manage permissions
          </li>
          <li>
            <strong>PDF Upload File System:</strong> Migration from Prisma
            database storage to file-system-based PDF storage
          </li>
        </ul>
      </div>

      <div className='mb-12'>
        <h2 className='mb-4 text-2xl font-semibold'>Partner Engagement Plan</h2>
        <ul className='mt-4 list-disc space-y-2 pl-6 text-lg'>
          <li>Set up and create a project on a free hosting account</li>
          <li>
            Inform partner organization of any potential costs during the
            handoff process
          </li>
          <li>
            Plan meetings approximately every two to three weeks, with email
            communication as needed
          </li>
          <li>
            Working with mentor to arrange initial partner meeting to create
            concrete engagement plan
          </li>
        </ul>
      </div>
    </div>
  );
}
