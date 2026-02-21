import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Project Demo',
  description: 'Demo of our project',
};

const demoPresentationLink =
  'https://gtvault-my.sharepoint.com/:v:/g/personal/tbahbouche3_gatech_edu/ERZSTSkHvYNOvWsbt7dTjr4BccwtN4UQXSZ6Js2xnvy5Jg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=LhnPF8';

export default function DemoPage() {
  return (
    <div>
      <h1 className='mb-4 text-2xl font-semibold underline'>
        <Link href={demoPresentationLink} className='text-blue-600 underline'>
          Project Demo
        </Link>
      </h1>
    </div>
  );
}
