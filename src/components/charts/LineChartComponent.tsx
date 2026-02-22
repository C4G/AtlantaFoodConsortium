'use client';

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
}

export function LineChartComponent({
  data,
  lines,
  xAxisKey,
  title,
}: LineChartComponentProps) {
  return (
    <div className='w-full'>
      {title && (
        <h3 className='mb-4 text-center text-lg font-semibold text-slate-800'>
          {title}
        </h3>
      )}
      <ResponsiveContainer width='100%' height={400}>
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
