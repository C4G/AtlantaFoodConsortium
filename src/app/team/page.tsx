import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Our team and project information',
};

const team = [
  {
    name: 'Abhishek Karkar',
    role: 'Backend Development',
    imageUrl: 'https://ui-avatars.com/api/?name=A+K&format=png',
  },
  {
    name: 'Akram Alsamarae',
    role: 'Frontend Development',
    imageUrl: 'https://ui-avatars.com/api/?name=A+A&format=png',
  },
  {
    name: 'Akrem Abdelwahab',
    role: 'Backend Development',
    imageUrl: 'https://ui-avatars.com/api/?name=A+A&format=png',
  },
  {
    name: 'Mika Yoshimura',
    role: 'Frontend Development',
    imageUrl: 'https://ui-avatars.com/api/?name=M+Y&format=png',
  },
  {
    name: 'Taisiia Bahbouche',
    role: 'PM / QA',
    imageUrl: 'https://ui-avatars.com/api/?name=T+B&format=png',
  },
];

export default function TeamPage() {
  return (
    <div>
      <div className='py-12 sm:py-16'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16'>
            <h2 className='text-3xl font-semibold tracking-tight'>C4G Team</h2>
            <ul
              role='list'
              className='mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'
            >
              {team.map((member) => (
                <li key={member.name}>
                  <div className='flex items-center gap-x-6'>
                    <Image
                      alt={member.name}
                      src={member.imageUrl}
                      width={64}
                      height={64}
                      className='rounded-full'
                    />
                    <div>
                      <h3 className='text-base font-semibold'>{member.name}</h3>
                      <p className='text-sm font-semibold text-indigo-600'>
                        {member.role}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
