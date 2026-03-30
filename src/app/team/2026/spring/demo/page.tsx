import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Demo',
  description: 'Demo of our project',
};

export default function DemoPage() {
  return (
    <div className='flex flex-col items-center gap-6'>
      <h1 className='text-2xl font-semibold'>Project Demo</h1>
      <video
        className='w-full max-w-4xl rounded-lg shadow-lg'
        controls
        preload='metadata'
      >
        <source src='/team/2026/spring/Demo.mp4' type='video/mp4' />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
