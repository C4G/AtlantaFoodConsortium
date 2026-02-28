'use client';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { KPICard } from '@/components/charts/KPICard';
import { SUPPLIER_CHART_INFO } from '@/components/charts/chart-info-text';
import { SupplierMetrics } from '../_types';

interface OverviewTabProps {
  metricsData: SupplierMetrics | null;
  loadingMetrics: boolean;
}

const OverviewTab = ({ metricsData, loadingMetrics }: OverviewTabProps) => {
  if (loadingMetrics || !metricsData) {
    return (
      <div className='flex items-center justify-center py-20 text-slate-400'>
        Loading metrics...
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <KPICard
          title='Total Products'
          value={metricsData.totalProducts}
          subtitle='Posted to date'
          info={SUPPLIER_CHART_INFO.totalProducts}
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

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Product Status Breakdown */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <DonutChart
            title='Product Status Breakdown'
            info={SUPPLIER_CHART_INFO.productStatusBreakdown}
            data={[
              {
                name: 'Available',
                value: metricsData.statusBreakdown.AVAILABLE,
              },
              { name: 'Reserved', value: metricsData.statusBreakdown.RESERVED },
              { name: 'Pending', value: metricsData.statusBreakdown.PENDING },
            ].filter((item) => item.value > 0)}
            colors={['#10b981', '#3b82f6', '#f59e0b']}
          />
        </div>

        {/* Claim Speed Analysis */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <BarChartComponent
            title='Product Claim Speed'
            info={SUPPLIER_CHART_INFO.claimSpeed}
            data={[
              { timeframe: '< 24h', count: metricsData.claimSpeeds.within24h },
              { timeframe: '24-48h', count: metricsData.claimSpeeds.within48h },
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
            bars={[{ dataKey: 'count', fill: '#8b5cf6', name: 'Products' }]}
          />
        </div>

        {/* Product Type Breakdown */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
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
                value: metricsData.typeBreakdown.shelfStableIndividualServing,
              },
              {
                name: 'Prepared Food',
                value: metricsData.typeBreakdown.alreadyPreparedFood,
              },
              { name: 'Other', value: metricsData.typeBreakdown.other },
            ].filter((item) => item.value > 0)}
          />
        </div>

        {/* Monthly Timeline */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
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
      </div>
    </div>
  );
};

export default OverviewTab;
