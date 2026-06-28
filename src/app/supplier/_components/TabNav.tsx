'use client';

interface TabNavProps {
  activeTab: 'overview' | 'products';
  setActiveTab: (_tab: 'overview' | 'products') => void;
  productCount: number;
}

const TabNav = ({ activeTab, setActiveTab, productCount }: TabNavProps) => {
  return (
    <div className='mb-8 flex gap-2 border-b border-slate-200 dark:border-border'>
      {(
        [
          { key: 'overview', label: 'Overview' },
          { key: 'products', label: `My Products (${productCount})` },
        ] as const
      ).map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === key
              ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-muted-foreground dark:hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TabNav;
