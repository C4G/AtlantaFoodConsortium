import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Final Presentation',
  description: 'Final presentation video for the 2026 Spring semester',
};

export default function FinalPresentationPage() {
  return (
    <div className='flex flex-col items-center gap-6'>
      <h1 className='text-2xl font-semibold'>Final Presentation</h1>
      <video
        className='w-full max-w-4xl rounded-lg shadow-lg'
        controls
        preload='metadata'
      >
        <source
          src='/team/2026/spring/Final_Presentation.mp4'
          type='video/mp4'
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
