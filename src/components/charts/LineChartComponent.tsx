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
          <h3 className='text-center text-lg font-semibold text-slate-800'>
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
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor='end'
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type='monotone'
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
