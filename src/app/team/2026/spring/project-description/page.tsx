import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Description',
  description: 'Description of our project',
};

export default function ProjectDescriptionPage() {
  return (
    <div className='py-12 sm:py-16'>
      <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
        Metro Atlanta Food Consortium - Spring 2026
      </h2>

      <h3 className='mt-8 text-2xl font-semibold'>Project Overview</h3>
      <p className='mt-4 text-lg'>
        Building upon the foundation established by previous teams, our Spring
        2026 team is focused on enhancing the Metro Atlanta Food Consortium
        platform to ensure it meets production-ready standards and provides
        comprehensive support for all stakeholders.
      </p>

      <h3 className='mt-8 text-2xl font-semibold'>
        Partner Organization Needs
      </h3>
      <ul className='mt-4 list-disc space-y-2 pl-6 text-lg'>
        <li>
          Running through the application end-to-end and ensuring the workflow
          works as intended (including email notifications)
        </li>
        <li>
          Adding an administrative dashboard that shows statistics on the amount
          and types of food distributed through the platform
        </li>
        <li>
          Ensuring that enough user documentation exists in a publicly-facing
          site that we can point users to
        </li>
      </ul>

      <h3 className='mt-8 text-2xl font-semibold'>Our Mission</h3>
      <p className='mt-4 text-lg'>
        MAFC is a collaborative platform connecting philanthropy, non-profit,
        for-profit and government organizations to facilitate food access across
        Metro Atlanta. Our vision is simple yet powerful: No food wasted, no
        person experiencing hunger.
      </p>

      <h3 className='mt-8 text-2xl font-semibold'>The Challenge</h3>
      <p className='mt-4 text-lg'>
        One in nine people in the Metro Atlanta area are food insecure, while an
        estimated 125,000 tons of food waste is generated in Atlanta each year.
        Our platform bridges this gap by connecting food suppliers who have
        excess food with organizations serving those in need, before the food
        goes to waste.
      </p>
    </div>
  );
}
