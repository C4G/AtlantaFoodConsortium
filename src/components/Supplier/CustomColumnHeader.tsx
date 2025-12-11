import { LucideProps } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  icon: React.ComponentType<LucideProps>;
  displayName: string;
}
const CustomColumnHeader = ({ icon: HeaderIcon, displayName }: HeaderProps) => {
  return (
    <div className='flex w-full items-center justify-between'>
      {HeaderIcon && <HeaderIcon className='h-5 w-5' />}
      <span className='ml-2 flex-1'> {displayName}</span>
    </div>
  );
};
export default CustomColumnHeader;
