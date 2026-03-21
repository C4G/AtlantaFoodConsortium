'use client';

import { useIsMobile } from '@/hooks/use-is-mobile';
import { ChartInfoTooltip } from './ChartInfoTooltip';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartComponentProps {
  data: Array<Record<string, unknown>>;
  lines: Array<{ dataKey: string; stroke: string; name: string }>;
  xAxisKey: string;
  title?: string;
  info?: string;
}

export function LineChartComponent({
  data,
  lines,
  xAxisKey,
  title,
  info,
}: LineChartComponentProps) {
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
      <ResponsiveContainer width='100%' height={isMobile ? 260 : 400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey={xAxisKey}
            angle={0}
            textAnchor='middle'
            interval='preserveStartEnd'
            minTickGap={50}
            height={40}
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--foreground))' }}
            tickLine={{ stroke: 'hsl(var(--foreground))' }}
          />
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
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type='monotone'
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              strokeWidth={2}
              wrapperStyle={{ marginTop: 20 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
