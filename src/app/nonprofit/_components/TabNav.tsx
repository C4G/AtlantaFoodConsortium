'use client';

interface TabNavProps {
  activeTab: 'overview' | 'available' | 'claims';
  setActiveTab: (_tab: 'overview' | 'available' | 'claims') => void;
  availableCount: number;
  claimedCount: number;
}

const TabNav = ({
  activeTab,
  setActiveTab,
  availableCount,
  claimedCount,
}: TabNavProps) => {
  return (
    <div className='flex gap-2 border-b border-border'>
      {(
        [
          { key: 'overview', label: 'Overview' },
          { key: 'available', label: `Available Products (${availableCount})` },
          { key: 'claims', label: `My Claims (${claimedCount})` },
        ] as const
      ).map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === key
              ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TabNav;
