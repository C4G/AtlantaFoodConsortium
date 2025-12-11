import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Goal',
  description: 'Goals of our project',
};

export default function ProjectGoalPage() {
  return (
    <div className='py-12 sm:py-16'>
      <h1 className='mb-4 text-2xl font-semibold'>Project Goals</h1>
      <div className='mb-16'>
        <ul className='mt-4 list-disc pl-6 text-lg'>
          <li>
            Create a digital platform connecting food suppliers with
            distribution organizations
          </li>
          <li>
            Facilitate efficient food redistribution through real-time matching
          </li>
          <li>
            Enable collaboration between non-profits in the food-serving space
          </li>
        </ul>
      </div>
      <div className='mb-16'>
        <h1 className='mb-4 text-2xl font-semibold'>Intended Outcomes</h1>
        <ul className='mt-4 list-disc pl-6 text-lg'>
          <li>
            Streamline the process of food donation and distribution to those in
            need
          </li>
          <li>
            Provide a platform for organizations to find and connect with each
            other
          </li>
          <li>
            Increase the visibility of organizations that are working to address
            food insecurity
          </li>
        </ul>
      </div>
    </div>
  );
}
