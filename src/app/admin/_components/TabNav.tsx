interface TabNavProps {
  activeTab: string;
  setActiveTab: (_tab: string) => void;
  supplierCount: number;
  nonprofitCount: number;
  productRequestCount: number;
}

const TabNav = ({
  activeTab,
  setActiveTab,
  supplierCount,
  nonprofitCount,
  productRequestCount,
}: TabNavProps) => {
  const tabs = [
    {
      label: 'Overview',
      count: null as number | null,
      tab: 'overview',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='mb-1 h-6 w-6 text-blue-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
          />
        </svg>
      ),
    },
    {
      label: 'Suppliers',
      count: supplierCount,
      tab: 'suppliers',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='mb-1 h-6 w-6 text-blue-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      ),
    },
    {
      label: 'Nonprofits',
      count: nonprofitCount,
      tab: 'nonprofits',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='mb-1 h-6 w-6 text-blue-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
          />
        </svg>
      ),
    },
    {
      label: 'Product Requests',
      count: productRequestCount,
      tab: 'productRequests',
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='mb-1 h-6 w-6 text-blue-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      ),
    },
  ];

  return (
    <div className='sticky top-0 z-10 bg-slate-50 p-2'>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        {tabs.map(({ label, count, tab, icon }) => (
          <div
            key={tab}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg p-6 shadow-md transition duration-200 ${
              activeTab === tab
                ? 'border border-blue-200 bg-blue-50'
                : 'border border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {icon}
            <p className='text-lg font-semibold text-slate-700'>{label}</p>
            {count !== null ? (
              <p className='text-3xl font-bold text-slate-900'>{count}</p>
            ) : (
              <p className='select-none text-3xl font-bold text-transparent'>
                0
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabNav;
