'use client';
import { ChartInfoTooltip } from '@/components/charts/ChartInfoTooltip';
import { NONPROFIT_CHART_INFO } from '@/components/charts/chart-info-text';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { DonutChart } from '@/components/charts/DonutChart';
import { KPICard } from '@/components/charts/KPICard';
import { NonprofitMetrics, ProductInterest } from '../_types';

interface OverviewTabProps {
  metricsData: NonprofitMetrics | null;
  loadingMetrics: boolean;
  productInterests: ProductInterest | null;
  availableCount: number;
}

const OverviewTab = ({
  metricsData,
  loadingMetrics,
  productInterests,
  availableCount,
}: OverviewTabProps) => {
  if (loadingMetrics || !metricsData) return null;

  return (
    <div className='space-y-6'>
      <div className='flex items-center'>
        <h2 className='text-2xl font-bold text-slate-800'>
          Your Activity & Insights
        </h2>
        <div className='ml-4 h-px flex-grow bg-slate-200'></div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <KPICard
          title='Products Claimed'
          value={metricsData.totalClaimed}
          subtitle='Total claimed'
          info={NONPROFIT_CHART_INFO.productsClaimed}
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
          title='Upcoming Pickups'
          value={metricsData.upcomingPickups.length}
          subtitle='Next 30 days'
          info={NONPROFIT_CHART_INFO.upcomingPickups}
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
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          }
        />
        <KPICard
          title='Available Products'
          value={availableCount}
          subtitle='Ready to claim'
          info={NONPROFIT_CHART_INFO.availableProducts}
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
      </div>

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {metricsData.availabilityTrends.length > 0 && (
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
            <LineChartComponent
              title='Product Availability (Last 30 Days)'
              info={NONPROFIT_CHART_INFO.productAvailabilityTrend}
              data={metricsData.availabilityTrends}
              xAxisKey='date'
              lines={[
                {
                  dataKey: 'count',
                  stroke: '#3b82f6',
                  name: 'Available Products',
                },
              ]}
            />
          </div>
        )}

        {metricsData.monthlyTimeline.length > 0 && (
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
            <LineChartComponent
              title='Your Monthly Claims'
              info={NONPROFIT_CHART_INFO.monthlyClaimsTimeline}
              data={metricsData.monthlyTimeline}
              xAxisKey='month'
              lines={[
                {
                  dataKey: 'count',
                  stroke: '#10b981',
                  name: 'Products Claimed',
                },
              ]}
            />
          </div>
        )}

        {productInterests && (
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
            <div className='mb-4 flex items-center justify-center gap-2'>
              <h3 className='text-center text-lg font-semibold text-slate-800'>
                Product Interest Match Score
              </h3>
              <ChartInfoTooltip
                info={NONPROFIT_CHART_INFO.interestMatchScore}
                position='top'
              />
            </div>
            <div className='space-y-3'>
              {Object.entries(metricsData.matchScore)
                .filter(([key, value]) => {
                  const interestKey = key as keyof typeof productInterests;
                  return productInterests[interestKey] && value > 0;
                })
                .map(([key, value]) => (
                  <div key={key}>
                    <div className='mb-1 flex justify-between text-sm'>
                      <span className='font-medium text-slate-700'>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <span className='text-slate-600'>
                        {Math.round(value as number)}%
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-slate-200'>
                      <div
                        className='h-2 rounded-full bg-blue-600'
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {Object.values(metricsData.typeBreakdown).some((v) => v > 0) && (
          <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
            <DonutChart
              title='Your Claimed Product Types'
              info={NONPROFIT_CHART_INFO.claimedProductTypes}
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
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
