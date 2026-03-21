'use client';

import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChartInfoTooltip } from './ChartInfoTooltip';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartComponentProps {
  data: Array<Record<string, string | number>>;
  areas: Array<{ dataKey: string; stroke: string; fill: string; name: string }>;
  xAxisKey: string;
  title?: string;
  info?: string;
}

export function AreaChartComponent({
  data,
  areas,
  xAxisKey,
  title,
  info,
}: AreaChartComponentProps) {
  const isMobile = useIsMobile();

  return (
    <div className='w-full'>
      {title && (
        <div className='mb-4 flex items-center justify-center gap-2'>
          <h3 className='text-center text-lg font-semibold text-foreground'>
            {title}
          </h3>
          {info && <ChartInfoTooltip info={info} position='top' />}
        </div>
      )}
      <ResponsiveContainer width='100%' height={isMobile ? 250 : 350}>
        <AreaChart
          data={data}
          margin={{ bottom: isMobile ? 40 : 50, left: 10, right: 10 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey={xAxisKey}
            angle={-45}
            textAnchor='end'
            height={100}
            interval='preserveStartEnd'
            tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
          />
          <YAxis />
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
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type='monotone'
              dataKey={area.dataKey}
              stroke={area.stroke}
              fill={area.fill}
              name={area.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
