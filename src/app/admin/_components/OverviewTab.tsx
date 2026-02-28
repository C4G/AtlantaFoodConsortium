import { DonutChart } from '@/components/charts/DonutChart';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { KPICard } from '@/components/charts/KPICard';
import { ADMIN_CHART_INFO } from '@/components/charts/chart-info-text';
import { AnalyticsData } from '../_types';

interface OverviewTabProps {
  analyticsData: AnalyticsData | null;
  loading: boolean;
}

const OverviewTab = ({ analyticsData, loading }: OverviewTabProps) => {
  if (loading || !analyticsData) return null;

  return (
    <div className='my-8 space-y-6'>
      {/* System Health KPIs */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <KPICard
          title='Total Users'
          value={analyticsData.systemHealth.totalUsers}
          subtitle='Active in system'
          info={ADMIN_CHART_INFO.totalUsers}
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
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
              />
            </svg>
          }
        />
        <KPICard
          title='Avg Claim Time'
          value={`${analyticsData.systemHealth.avgClaimTimeHours}h`}
          subtitle='Hours to claim'
          info={ADMIN_CHART_INFO.avgClaimTime}
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
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
        />
        <KPICard
          title='Approval Rate'
          value={`${Math.round(analyticsData.systemHealth.approvalRate * 100)}%`}
          subtitle='Nonprofit approvals'
          info={ADMIN_CHART_INFO.approvalRate}
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
          title='Available Products'
          value={analyticsData.systemHealth.productsByStatus.AVAILABLE}
          subtitle='Ready to claim'
          info={ADMIN_CHART_INFO.availableProducts}
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
        {/* Product Distribution Donut Chart */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <DonutChart
            title='Product Type Distribution'
            info={ADMIN_CHART_INFO.productTypeDistribution}
            data={[
              {
                name: 'Protein',
                value: analyticsData.distribution.distribution.protein,
              },
              {
                name: 'Produce',
                value: analyticsData.distribution.distribution.produce,
              },
              {
                name: 'Shelf Stable',
                value: analyticsData.distribution.distribution.shelfStable,
              },
              {
                name: 'Individual Serving',
                value:
                  analyticsData.distribution.distribution
                    .shelfStableIndividualServing,
              },
              {
                name: 'Prepared Food',
                value:
                  analyticsData.distribution.distribution.alreadyPreparedFood,
              },
              {
                name: 'Other',
                value: analyticsData.distribution.distribution.other,
              },
            ].filter((item) => item.value > 0)}
          />
        </div>

        {/* Product Status Trends Line Chart */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <LineChartComponent
            title='Product Status Trends'
            info={ADMIN_CHART_INFO.productStatusTrends}
            data={analyticsData.trends.trends}
            xAxisKey='date'
            lines={[
              { dataKey: 'AVAILABLE', stroke: '#10b981', name: 'Available' },
              { dataKey: 'RESERVED', stroke: '#3b82f6', name: 'Reserved' },
              { dataKey: 'PENDING', stroke: '#f59e0b', name: 'Pending' },
            ]}
          />
        </div>

        {/* Supplier Activity Bar Chart */}
        <div className='flex h-[550px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <BarChartComponent
            title='Top Suppliers by Products'
            info={ADMIN_CHART_INFO.topSuppliers}
            data={analyticsData.supplierActivity.activity}
            xAxisKey='name'
            layout='vertical'
            bars={[
              {
                dataKey: 'productCount',
                fill: '#8b5cf6',
                name: 'Products Posted',
              },
            ]}
          />
        </div>

        {/* Nonprofit Engagement Bar Chart */}
        <div className='flex h-[550px] flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <BarChartComponent
            title='Top Nonprofits by Claims'
            info={ADMIN_CHART_INFO.topNonprofits}
            data={analyticsData.nonprofitEngagement.engagement}
            xAxisKey='name'
            layout='vertical'
            bars={[
              {
                dataKey: 'claimedCount',
                fill: '#ec4899',
                name: 'Products Claimed',
              },
            ]}
          />
        </div>

        {/* Organization Type Breakdown */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <DonutChart
            title='Nonprofit Organization Types'
            info={ADMIN_CHART_INFO.nonprofitOrgTypes}
            data={[
              {
                name: 'Food Bank',
                value:
                  analyticsData.nonprofitEngagement.orgTypeBreakdown.FOOD_BANK,
              },
              {
                name: 'Pantry',
                value:
                  analyticsData.nonprofitEngagement.orgTypeBreakdown.PANTRY,
              },
              {
                name: 'Student Pantry',
                value:
                  analyticsData.nonprofitEngagement.orgTypeBreakdown
                    .STUDENT_PANTRY,
              },
              {
                name: 'Food Rescue',
                value:
                  analyticsData.nonprofitEngagement.orgTypeBreakdown
                    .FOOD_RESCUE,
              },
              {
                name: 'Agriculture',
                value:
                  analyticsData.nonprofitEngagement.orgTypeBreakdown
                    .AGRICULTURE,
              },
              {
                name: 'Other',
                value: analyticsData.nonprofitEngagement.orgTypeBreakdown.OTHER,
              },
            ].filter((item) => item.value > 0)}
          />
        </div>

        {/* Supplier Cadence Breakdown */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md'>
          <DonutChart
            title='Supplier Posting Cadence'
            info={ADMIN_CHART_INFO.supplierCadence}
            data={[
              {
                name: 'Daily',
                value: analyticsData.supplierActivity.cadenceBreakdown.DAILY,
              },
              {
                name: 'Weekly',
                value: analyticsData.supplierActivity.cadenceBreakdown.WEEKLY,
              },
              {
                name: 'Biweekly',
                value: analyticsData.supplierActivity.cadenceBreakdown.BIWEEKLY,
              },
              {
                name: 'Monthly',
                value: analyticsData.supplierActivity.cadenceBreakdown.MONTHLY,
              },
              {
                name: 'TBD',
                value: analyticsData.supplierActivity.cadenceBreakdown.TBD,
              },
            ].filter((item) => item.value > 0)}
          />
        </div>

        {/* Claims Over Time Line Chart */}
        <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md lg:col-span-2'>
          <LineChartComponent
            title='Claims Over Time'
            info={ADMIN_CHART_INFO.claimsOverTime}
            data={analyticsData.claimsOverTime.timeline}
            xAxisKey='month'
            lines={[{ dataKey: 'count', stroke: '#ec4899', name: 'Claims' }]}
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
