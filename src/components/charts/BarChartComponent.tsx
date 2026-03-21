'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChartInfoTooltip } from './ChartInfoTooltip';

interface BarChartComponentProps {
  data: Array<Record<string, unknown>>;
  bars: Array<{ dataKey: string; fill: string; name: string }>;
  xAxisKey: string;
  title?: string;
  info?: string;
  layout?: 'horizontal' | 'vertical';
  itemsPerPage?: number;
}

export function BarChartComponent({
  data,
  bars,
  xAxisKey,
  title,
  info,
  layout = 'horizontal',
  itemsPerPage,
}: BarChartComponentProps) {
  const resolvedItemsPerPage = itemsPerPage || 10;
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();

  // Pagination logic
  const totalPages = Math.ceil(data.length / resolvedItemsPerPage);
  const startIndex = (currentPage - 1) * resolvedItemsPerPage;
  const endIndex = startIndex + resolvedItemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const isPaginated = data.length > resolvedItemsPerPage;

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={`mb-4 flex flex-wrap items-center gap-y-2 ${
          isPaginated ? 'justify-between' : 'justify-center'
        }`}
      >
        <div className='flex items-center gap-2'>
          {title && (
            <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
          )}
          {info && <ChartInfoTooltip info={info} position='top' />}
        </div>
        {isPaginated && (
          <div className='flex items-center gap-3'>
            <span className='hidden text-sm text-foreground sm:inline'>
              Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of{' '}
              {data.length}
            </span>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='rounded border p-1 text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
                aria-label='Previous page'
              >
                <ChevronLeft className='h-4 w-4 text-foreground' />
              </button>
              <span className='px-3 text-sm font-medium text-foreground'>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className='rounded border p-1 text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50'
                aria-label='Next page'
              >
                <ChevronRight className='h-4 w-4 text-foreground' />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className='min-h-0 flex-1'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={paginatedData}
            layout={layout}
            margin={
              layout === 'vertical'
                ? { top: 5, right: 10, bottom: 5, left: 10 }
                : { bottom: 50, left: 10, right: 10 }
            }
          >
            <CartesianGrid strokeDasharray='3 3' />
            {layout === 'horizontal' ? (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor='end'
                  height={100}
                  interval={0}
                />
                <YAxis />
              </>
            ) : (
              <>
                <XAxis type='number' />
                <YAxis
                  dataKey={xAxisKey}
                  type='category'
                  width={isMobile ? 90 : 150}
                  tick={{ fontSize: isMobile ? 9 : 11 }}
                  interval={0}
                />
              </>
            )}
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
