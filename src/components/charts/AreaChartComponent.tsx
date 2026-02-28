'use client';

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
      <ResponsiveContainer width='100%' height={350}>
        <AreaChart data={data} margin={{ bottom: 50, left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor='end'
            height={100}
            interval='preserveStartEnd'
          />
          <YAxis />
          <Tooltip />
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
