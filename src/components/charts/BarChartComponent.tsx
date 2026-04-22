'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  /** Per-item colors — when provided, each bar gets its own color and a custom legend is rendered */
  cellColors?: string[];
}

export function BarChartComponent({
  data,
  bars,
  xAxisKey,
  title,
  info,
  layout = 'horizontal',
  itemsPerPage,
  cellColors,
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

  const useCellColors = cellColors && cellColors.length >= data.length;

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        className={`mb-4 flex flex-wrap items-center gap-y-2 ${
          isPaginated ? 'justify-between' : 'justify-center'
        }`}
      >
        <div className='flex items-center gap-2'>
          {title && (
            <h3 className='text-lg font-semibold text-slate-800'>{title}</h3>
          )}
          {info && <ChartInfoTooltip info={info} position='top' />}
        </div>
        {isPaginated && (
          <div className='flex items-center gap-3'>
            <span className='hidden text-sm text-muted-foreground sm:inline'>
              Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of{' '}
              {data.length}
            </span>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='rounded border border-border p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
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
                className='rounded border border-border p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
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
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(148, 163, 184, 0.2)'
            />
            {layout === 'horizontal' ? (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={{ stroke: '#94a3b8' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={{ stroke: '#94a3b8' }}
                  allowDecimals={false}
                />
              </>
            ) : (
              <>
                <XAxis
                  type='number'
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={{ stroke: '#94a3b8' }}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey={xAxisKey}
                  type='category'
                  width={isMobile ? 100 : 160}
                  tick={{ fontSize: isMobile ? 11 : 13, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  tickLine={{ stroke: '#94a3b8' }}
                  interval={0}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                color: '#f1f5f9',
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: '4px',
                color: '#f1f5f9',
              }}
              itemStyle={{ color: '#cbd5e1' }}
              cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                radius={[4, 4, 4, 4]}
              >
                {useCellColors &&
                  paginatedData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={cellColors[startIndex + idx] || bar.fill}
                    />
                  ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend when using per-item colors */}
      {useCellColors && (
        <div className='mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1'>
          {data.map((item, idx) => (
            <div key={idx} className='flex items-center gap-1.5'>
              <span
                className='inline-block h-3 w-3 rounded-sm'
                style={{ backgroundColor: cellColors[idx] }}
              />
              <span className='text-xs text-muted-foreground'>
                {String(item[xAxisKey])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
