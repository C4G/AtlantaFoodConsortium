'use client';
import { useState, useMemo } from 'react';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { KPICard } from '@/components/charts/KPICard';
import { SUPPLIER_CHART_INFO } from '@/components/charts/chart-info-text';
import { SupplierMetrics } from '../_types';
import { ProductRequest } from '../../../../types/types';
import {
  ArrowLeft,
  Search,
  Package,
  Scale,
  TrendingUp,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

type TileFilter = 'all' | 'available' | 'claimed' | 'fast';

interface OverviewTabProps {
  metricsData: SupplierMetrics | null;
  loadingMetrics: boolean;
  productRequests: ProductRequest[];
}

function findFoodType(product: ProductRequest): string {
  const pt = product.productType;
  if (!pt) return 'Unknown';
  if (pt.protein) return 'Protein';
  if (pt.produce) return 'Produce';
  if (pt.shelfStable) return 'Shelf Stable';
  if (pt.shelfStableIndividualServing) return 'Individual Serving';
  if (pt.alreadyPreparedFood) return 'Prepared Food';
  if (pt.other) return 'Other';
  return 'Unknown';
}

function filterProducts(
  products: ProductRequest[],
  filter: TileFilter
): ProductRequest[] {
  switch (filter) {
    case 'available':
      return products.filter((p) => p.status === 'AVAILABLE');
    case 'claimed':
      return products.filter((p) => ['RESERVED', 'PENDING'].includes(p.status));
    case 'fast':
      return products.filter((p) => {
        if (!['RESERVED', 'PENDING'].includes(p.status)) return false;
        const diffMs =
          new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
        return diffMs / (1000 * 60 * 60) <= 24;
      });
    default:
      return products;
  }
}

const TYPE_COLORS: Record<string, string> = {
  Protein: '#ef4444',
  Produce: '#22c55e',
  'Shelf Stable': '#f59e0b',
  'Individual Serving': '#a855f7',
  'Prepared Food': '#f97316',
  Other: '#6b7280',
  Unknown: '#94a3b8',
};

const FILTER_CONFIG: Record<
  Exclude<TileFilter, 'all'>,
  { title: string; barTitle: string; color: string }
> = {
  available: {
    title: 'Available Products',
    barTitle: 'Available Products by Type',
    color: '#10b981',
  },
  claimed: {
    title: 'Claimed Products',
    barTitle: 'Claimed Products by Type',
    color: '#3b82f6',
  },
  fast: {
    title: 'Fast Claims (Within 24h)',
    barTitle: 'Fast Claims by Type',
    color: '#f59e0b',
  },
};

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Sort helpers ──
type SortKey =
  | 'name'
  | 'type'
  | 'quantity'
  | 'status'
  | 'posted'
  | 'claimSpeed';
type SortDir = 'asc' | 'desc';

function getClaimHours(p: ProductRequest): number {
  if (!['RESERVED', 'PENDING'].includes(p.status)) return Infinity;
  return (
    (new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime()) /
    (1000 * 60 * 60)
  );
}

function getClaimSpeedLabel(hours: number): string {
  if (hours === Infinity) return '';
  if (hours <= 24) return '< 24h';
  if (hours <= 48) return '24-48h';
  if (hours <= 168) return '< 1 week';
  return '> 1 week';
}

function sortProducts(
  products: ProductRequest[],
  key: SortKey,
  dir: SortDir
): ProductRequest[] {
  const sorted = [...products].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'type':
        cmp = findFoodType(a).localeCompare(findFoodType(b));
        break;
      case 'quantity':
        cmp = a.quantity - b.quantity;
        break;
      case 'status':
        cmp = a.status.localeCompare(b.status);
        break;
      case 'posted':
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'claimSpeed':
        cmp = getClaimHours(a) - getClaimHours(b);
        break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// ── Sparkline: tiny area chart for stat cards ──
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className='h-8 w-20'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient
              id={`spark-${color.replace('#', '')}`}
              x1='0'
              y1='0'
              x2='0'
              y2='1'
            >
              <stop offset='0%' stopColor={color} stopOpacity={0.3} />
              <stop offset='100%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type='monotone'
            dataKey='v'
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Build weekly buckets for sparkline data ──
function buildWeeklyBuckets(
  products: ProductRequest[],
  weeks: number = 8
): Date[] {
  const buckets: Date[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    d.setHours(0, 0, 0, 0);
    buckets.push(d);
  }
  return buckets;
}

function weeklyCountSpark(products: ProductRequest[]): number[] {
  const buckets = buildWeeklyBuckets(products);
  return buckets.map((weekStart, i) => {
    const weekEnd =
      i < buckets.length - 1
        ? buckets[i + 1]
        : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return products.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;
  });
}

function weeklyQtySpark(products: ProductRequest[]): number[] {
  const buckets = buildWeeklyBuckets(products);
  return buckets.map((weekStart, i) => {
    const weekEnd =
      i < buckets.length - 1
        ? buckets[i + 1]
        : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return products
      .filter((p) => {
        const d = new Date(p.createdAt);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, p) => sum + p.quantity, 0);
  });
}

// ── Sortable table header ──
function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (_key: SortKey) => void;
}) {
  const isActive = currentKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      tabIndex={0}
      aria-sort={
        isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      className='cursor-pointer select-none px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-800 dark:text-foreground'
    >
      <div className='flex items-center gap-1'>
        {label}
        <span className='inline-flex flex-col'>
          {isActive ? (
            currentDir === 'asc' ? (
              <ChevronUp className='h-3.5 w-3.5 text-blue-600' />
            ) : (
              <ChevronDown className='h-3.5 w-3.5 text-blue-600' />
            )
          ) : (
            <ChevronsUpDown className='h-3.5 w-3.5 text-slate-300' />
          )}
        </span>
      </div>
    </th>
  );
}

// ── Detail view shown when a category tile is clicked ──
function CategoryDetail({
  filter,
  products,
  onBack,
}: {
  filter: Exclude<TileFilter, 'all'>;
  products: ProductRequest[];
  onBack: () => void;
}) {
  const config = FILTER_CONFIG[filter];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('posted');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const type = findFoodType(p);
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const filteredTableProducts = useMemo(() => {
    let list = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          findFoodType(p).toLowerCase().includes(q)
      );
    }
    return sortProducts(list, sortKey, sortDir);
  }, [products, searchQuery, sortKey, sortDir]);

  // Summary stats
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const topType = typeBreakdown.length > 0 ? typeBreakdown[0].type : 'N/A';
  const avgClaimHours = useMemo(() => {
    if (filter === 'available') return null;
    const claimed = products.filter((p) =>
      ['RESERVED', 'PENDING'].includes(p.status)
    );
    if (claimed.length === 0) return null;
    const totalHours = claimed.reduce((sum, p) => {
      const diffMs =
        new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
      return sum + diffMs / (1000 * 60 * 60);
    }, 0);
    const avg = totalHours / claimed.length;
    if (avg < 24) return `${Math.round(avg)}h`;
    return `${(avg / 24).toFixed(1)}d`;
  }, [products, filter]);

  // Sparkline data
  const countSpark = useMemo(() => weeklyCountSpark(products), [products]);
  const qtySpark = useMemo(() => weeklyQtySpark(products), [products]);

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onBack}
            className='flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-secondary dark:hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <div>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-foreground'>
              {config.title}
            </h2>
            <p className='text-sm text-slate-500 dark:text-muted-foreground'>
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </div>

      {/* Mini stat cards with sparklines */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card'>
          <div className='flex items-center gap-2 text-slate-500 dark:text-muted-foreground'>
            <Package className='h-4 w-4' />
            <span className='text-xs font-medium uppercase tracking-wide'>
              Count
            </span>
          </div>
          <div className='mt-1 flex items-end justify-between'>
            <p className='text-xl font-bold text-slate-900 dark:text-foreground'>
              {products.length}
            </p>
            <Sparkline data={countSpark} color='#3b82f6' />
          </div>
        </div>
        <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card'>
          <div className='flex items-center gap-2 text-slate-500 dark:text-muted-foreground'>
            <Scale className='h-4 w-4' />
            <span className='text-xs font-medium uppercase tracking-wide'>
              Total Qty
            </span>
          </div>
          <div className='mt-1 flex items-end justify-between'>
            <p className='text-xl font-bold text-slate-900 dark:text-foreground'>
              {totalQuantity.toLocaleString()}
            </p>
            <Sparkline data={qtySpark} color='#10b981' />
          </div>
        </div>
        <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card'>
          <div className='flex items-center gap-2 text-slate-500 dark:text-muted-foreground'>
            <TrendingUp className='h-4 w-4' />
            <span className='text-xs font-medium uppercase tracking-wide'>
              Top Type
            </span>
          </div>
          <p className='mt-1 text-xl font-bold text-slate-900 dark:text-foreground'>
            {topType}
          </p>
        </div>
        {avgClaimHours !== null && (
          <div className='rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card'>
            <div className='flex items-center gap-2 text-slate-500 dark:text-muted-foreground'>
              <Clock className='h-4 w-4' />
              <span className='text-xs font-medium uppercase tracking-wide'>
                Avg Claim
              </span>
            </div>
            <p className='mt-1 text-xl font-bold text-slate-900 dark:text-foreground'>
              {avgClaimHours}
            </p>
          </div>
        )}
      </div>

      {/* Product table */}
      <div className='rounded-lg border border-slate-200 bg-white shadow-md dark:border-border dark:bg-card'>
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-border sm:px-6'>
          <h3 className='font-semibold text-slate-800 dark:text-foreground'>
            Product List
          </h3>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-muted-foreground' />
            <input
              type='text'
              placeholder='Search products...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-border dark:bg-secondary dark:text-muted-foreground dark:placeholder:text-muted-foreground dark:focus:bg-secondary dark:focus:ring-blue-800'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='border-b border-slate-100 bg-slate-50/60 dark:border-border dark:bg-card/60'>
              <tr>
                <SortableHeader
                  label='Product'
                  sortKey='name'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Type'
                  sortKey='type'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Quantity'
                  sortKey='quantity'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Status'
                  sortKey='status'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label='Posted'
                  sortKey='posted'
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                {filter !== 'available' && (
                  <SortableHeader
                    label='Claim Speed'
                    sortKey='claimSpeed'
                    currentKey={sortKey}
                    currentDir={sortDir}
                    onSort={handleSort}
                  />
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-border'>
              {filteredTableProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={filter !== 'available' ? 6 : 5}
                    className='px-4 py-10 text-center text-slate-400 dark:text-muted-foreground'
                  >
                    {searchQuery
                      ? 'No products match your search.'
                      : 'No products in this category.'}
                  </td>
                </tr>
              ) : (
                filteredTableProducts.map((p) => {
                  const hours = getClaimHours(p);
                  const claimSpeed = getClaimSpeedLabel(hours);

                  return (
                    <tr
                      key={p.id}
                      className='transition-colors hover:bg-slate-50 dark:hover:bg-secondary'
                    >
                      <td className='px-4 py-3 font-medium text-slate-900 dark:text-foreground'>
                        {p.name}
                      </td>
                      <td className='px-4 py-3'>
                        <span className='inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-secondary dark:text-muted-foreground'>
                          {findFoodType(p)}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-slate-600 dark:text-muted-foreground'>
                        {p.quantity} {p.unit?.toLowerCase()}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === 'AVAILABLE'
                              ? 'bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-900/40 dark:text-green-400 dark:ring-green-800'
                              : p.status === 'RESERVED'
                                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:ring-blue-800'
                                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-800'
                          }`}
                        >
                          {formatStatus(p.status)}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-slate-500 dark:text-muted-foreground'>
                        {formatDate(p.createdAt)}
                      </td>
                      {filter !== 'available' && (
                        <td className='px-4 py-3'>
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                              claimSpeed === '< 24h'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                : claimSpeed === '24-48h'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400'
                                  : claimSpeed === '< 1 week'
                                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-secondary dark:text-muted-foreground'
                            }`}
                          >
                            {claimSpeed}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredTableProducts.length > 0 && (
          <div className='border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400 dark:border-border dark:text-muted-foreground'>
            Showing {filteredTableProducts.length} of {products.length} products
          </div>
        )}
      </div>

      {/* Bar chart by type */}
      {typeBreakdown.length > 0 && (
        <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-md dark:border-border dark:bg-card sm:p-6'>
          <div className='h-80'>
            <BarChartComponent
              title={config.barTitle}
              data={typeBreakdown}
              xAxisKey='type'
              bars={[{ dataKey: 'count', fill: '#94a3b8', name: 'Count' }]}
              cellColors={typeBreakdown.map(
                (item) => TYPE_COLORS[item.type] || '#94a3b8'
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main overview (default view with KPI cards + charts) ──
const OverviewTab = ({
  metricsData,
  loadingMetrics,
  productRequests,
}: OverviewTabProps) => {
  const [activeFilter, setActiveFilter] = useState<TileFilter>('all');

  const filteredProducts = useMemo(
    () => filterProducts(productRequests, activeFilter),
    [productRequests, activeFilter]
  );

  if (loadingMetrics || !metricsData) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400 dark:text-muted-foreground'>
        Loading metrics...
      </div>
    );
  }

  const handleTileClick = (filter: TileFilter) => {
    setActiveFilter(filter);
  };

  const hasStatusData = Object.values(metricsData.statusBreakdown).some(
    (v) => v > 0
  );
  const hasClaimSpeedData = Object.values(metricsData.claimSpeeds).some(
    (v) => v > 0
  );
  const hasTypeData = Object.values(metricsData.typeBreakdown).some(
    (v) => v > 0
  );
  const hasTimeline = metricsData.monthlyTimeline.length > 0;

  return (
    <div className='space-y-6'>
      {/* KPI Cards — always visible */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <KPICard
          title='Total Products'
          value={metricsData.totalProducts}
          subtitle='Posted to date'
          info={SUPPLIER_CHART_INFO.totalProducts}
          active={activeFilter === 'all'}
          onClick={() => handleTileClick('all')}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
              />
            </svg>
          }
        />
        <KPICard
          title='Available'
          value={metricsData.statusBreakdown.AVAILABLE}
          subtitle='Currently available'
          info={SUPPLIER_CHART_INFO.available}
          active={activeFilter === 'available'}
          onClick={() => handleTileClick('available')}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          }
        />
        <KPICard
          title='Claimed'
          value={
            metricsData.statusBreakdown.RESERVED +
            metricsData.statusBreakdown.PENDING
          }
          subtitle='Successfully claimed'
          info={SUPPLIER_CHART_INFO.claimed}
          active={activeFilter === 'claimed'}
          onClick={() => handleTileClick('claimed')}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
        />
        <KPICard
          title='Fast Claims'
          value={metricsData.claimSpeeds.within24h}
          subtitle='Claimed within 24hrs'
          info={SUPPLIER_CHART_INFO.fastClaims}
          active={activeFilter === 'fast'}
          onClick={() => handleTileClick('fast')}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-8 w-8'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          }
        />
      </div>

      {/* Drill-down detail view for a selected category */}
      {activeFilter !== 'all' && (
        <CategoryDetail
          filter={activeFilter}
          products={filteredProducts}
          onBack={() => setActiveFilter('all')}
        />
      )}

      {/* Default overview charts (only when no category is selected) */}
      {activeFilter === 'all' && (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {hasStatusData && (
            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-border dark:bg-card sm:p-6'>
              <DonutChart
                title='Product Status Breakdown'
                info={SUPPLIER_CHART_INFO.productStatusBreakdown}
                data={[
                  {
                    name: 'Available',
                    value: metricsData.statusBreakdown.AVAILABLE,
                  },
                  {
                    name: 'Reserved',
                    value: metricsData.statusBreakdown.RESERVED,
                  },
                  {
                    name: 'Pending',
                    value: metricsData.statusBreakdown.PENDING,
                  },
                ].filter((item) => item.value > 0)}
                colors={['#10b981', '#3b82f6', '#f59e0b']}
              />
            </div>
          )}

          {hasClaimSpeedData && (
            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-border dark:bg-card sm:p-6'>
              <BarChartComponent
                title='Product Claim Speed'
                info={SUPPLIER_CHART_INFO.claimSpeed}
                data={[
                  {
                    timeframe: '< 24h',
                    count: metricsData.claimSpeeds.within24h,
                  },
                  {
                    timeframe: '24-48h',
                    count: metricsData.claimSpeeds.within48h,
                  },
                  {
                    timeframe: '< 1 week',
                    count: metricsData.claimSpeeds.within1week,
                  },
                  {
                    timeframe: '> 1 week',
                    count: metricsData.claimSpeeds.moreThan1week,
                  },
                ]}
                xAxisKey='timeframe'
                bars={[{ dataKey: 'count', fill: '#8b5cf6', name: 'Count' }]}
                cellColors={['#10b981', '#3b82f6', '#a855f7', '#f59e0b']}
              />
            </div>
          )}

          {hasTypeData && (
            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-border dark:bg-card sm:p-6'>
              <DonutChart
                title='Product Type Distribution'
                info={SUPPLIER_CHART_INFO.productTypeDistribution}
                data={[
                  { name: 'Protein', value: metricsData.typeBreakdown.protein },
                  { name: 'Produce', value: metricsData.typeBreakdown.produce },
                  {
                    name: 'Shelf Stable',
                    value: metricsData.typeBreakdown.shelfStable,
                  },
                  {
                    name: 'Individual Serving',
                    value:
                      metricsData.typeBreakdown.shelfStableIndividualServing,
                  },
                  {
                    name: 'Prepared Food',
                    value: metricsData.typeBreakdown.alreadyPreparedFood,
                  },
                  { name: 'Other', value: metricsData.typeBreakdown.other },
                ].filter((item) => item.value > 0)}
              />
            </div>
          )}

          {hasTimeline && (
            <div className='rounded-lg border border-slate-200 bg-white p-3 shadow-md dark:border-border dark:bg-card sm:p-6'>
              <AreaChartComponent
                title='Monthly Impact Timeline'
                info={SUPPLIER_CHART_INFO.monthlyTimeline}
                data={metricsData.monthlyTimeline}
                xAxisKey='month'
                areas={[
                  {
                    dataKey: 'count',
                    stroke: '#3b82f6',
                    fill: '#93c5fd',
                    name: 'Products Posted',
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
