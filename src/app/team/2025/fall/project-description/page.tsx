import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Description',
  description: 'Description of our project',
};

export default function ProjectDescriptionPage() {
  return (
    <div className='py-12 sm:py-16'>
      <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
        Metro Atlanta Food Consortium
      </h2>
      <h3 className='mt-6 text-2xl font-semibold'>Our Mission</h3>
      <p className='mt-6 text-lg'>
        MAFC is a collaborative platform connecting philanthropy, non-profit,
        for-profit and government organizations to facilitate food access across
        Metro Atlanta. Our vision is simple yet powerful: No food wasted, no
        person experiencing hunger.
      </p>

      <h3 className='mt-12 text-2xl font-semibold'>The Challenge</h3>
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
