import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Spring 2026 Team',
  description: 'Our Spring 2026 team members',
};

const team = [
  {
    name: 'Kierstin Hicks',
    role: 'UI/UX & Product',
    imageUrl: 'https://ui-avatars.com/api/?name=K+H&format=png',
  },
  {
    name: 'William Hao',
    role: 'Full Stack Developer',
    imageUrl: 'https://ui-avatars.com/api/?name=W+H&format=png',
  },
  {
    name: 'Srivatsa, Srijan',
    role: 'Project Manager',
    imageUrl: 'https://ui-avatars.com/api/?name=S+S&format=png',
  },
  {
    name: 'Richard Young',
    role: 'Full Stack Developer',
    imageUrl: 'https://ui-avatars.com/api/?name=R+Y&format=png',
  },
  {
    name: 'Wesley Baker',
    role: 'Full Stack Developer',
    imageUrl: 'https://ui-avatars.com/api/?name=W+B&format=png',
  },
  {
    name: 'Dipen Patel',
    role: 'Devops Engineer',
    imageUrl: 'https://ui-avatars.com/api/?name=D+P&format=png',
  },
];

export default function TeamPage() {
  return (
    <div>
      <div className='py-12 sm:py-16'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16'>
            <h2 className='text-3xl font-semibold tracking-tight'>
              Spring 2026 Team
            </h2>
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
