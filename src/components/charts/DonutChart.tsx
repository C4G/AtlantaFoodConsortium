'use client';

import { memo, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChartInfoTooltip } from './ChartInfoTooltip';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  title?: string;
  info?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const DonutChart = memo(function DonutChart({
  data,
  colors = DEFAULT_COLORS,
  title,
  info,
}: DonutChartProps) {
  const hasAnimated = useRef(false);
  const isMobile = useIsMobile();

  return (
    <div className='w-full'>
      {title && (
        <div className='mb-4 flex items-center justify-center gap-2'>
          <h3 className='text-center text-lg font-semibold text-slate-800'>
            {title}
          </h3>
          {info && <ChartInfoTooltip info={info} position='top' />}
        </div>
      )}
      <ResponsiveContainer width='100%' height={isMobile ? 300 : 400}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='45%'
            innerRadius={isMobile ? 48 : 60}
            outerRadius={isMobile ? 68 : 85}
            fill='#8884d8'
            paddingAngle={5}
            dataKey='value'
            isAnimationActive={!hasAnimated.current}
            onAnimationEnd={() => {
              hasAnimated.current = true;
            }}
            label={
              isMobile
                ? undefined
                : ({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
            labelLine={isMobile ? false : { stroke: '#94a3b8', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
