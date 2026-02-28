'use client';

import { ChartInfoTooltip } from './ChartInfoTooltip';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  info?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  info,
  trend,
}: KPICardProps) {
  return (
    <div className='rounded-lg border border-slate-200 bg-white p-6 shadow-md transition-all hover:shadow-lg'>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-1.5'>
            <p className='text-sm font-medium text-slate-600'>{title}</p>
            {info && (
              <ChartInfoTooltip info={info} position='bottom' size='sm' />
            )}
          </div>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{value}</p>
          {subtitle && (
            <p className='mt-1 text-sm text-slate-500'>{subtitle}</p>
          )}
          {trend && (
            <div className='mt-2 flex items-center'>
              <span
                className={`text-sm font-medium ${
                  trend.value > 0
                    ? 'text-green-600'
                    : trend.value < 0
                      ? 'text-red-600'
                      : 'text-slate-600'
                }`}
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}{' '}
                {Math.abs(trend.value)}%
              </span>
              <span className='ml-2 text-sm text-slate-500'>{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className='ml-4 text-blue-600'>{icon}</div>}
      </div>
    </div>
  );
}
