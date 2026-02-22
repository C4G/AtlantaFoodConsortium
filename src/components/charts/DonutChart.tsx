'use client';

import { memo, useRef } from 'react';
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
}: DonutChartProps) {
  const hasAnimated = useRef(false);

  return (
    <div className='w-full'>
      {title && (
        <h3 className='mb-4 text-center text-lg font-semibold text-slate-800'>
          {title}
        </h3>
      )}
      <ResponsiveContainer width='100%' height={400} minWidth={300}>
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='45%'
            innerRadius={60}
            outerRadius={85}
            fill='#8884d8'
            paddingAngle={5}
            dataKey='value'
            isAnimationActive={!hasAnimated.current}
            onAnimationEnd={() => {
              hasAnimated.current = true;
            }}
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
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
